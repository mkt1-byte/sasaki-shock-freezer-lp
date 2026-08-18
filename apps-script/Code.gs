/**
 * ============================================================
 * SASAKI Shock Freezer — Backend nhận lead từ Landing Page
 * ============================================================
 *
 * CÁCH CÀI (làm 1 lần, khoảng 10 phút):
 *
 *  1. Tạo Google Sheet mới, đặt tên: "SASAKI Shock Freezer - Lead 2026"
 *  2. Trong Sheet: menu Tiện ích mở rộng → Apps Script
 *  3. Xóa hết code mẫu, dán toàn bộ file này vào
 *  4. Sửa 3 hằng số ở khối CAU_HINH bên dưới (email Sales, tên sheet)
 *  5. Chạy hàm taoTieuDe() một lần để tạo dòng tiêu đề
 *  6. Bấm Triển khai → Tùy chọn triển khai mới
 *       · Loại: Ứng dụng web
 *       · Thực thi với tên: Tôi
 *       · Ai có quyền truy cập: BẤT KỲ AI          ← bắt buộc, nếu không form sẽ lỗi
 *  7. Copy URL dạng https://script.google.com/macros/s/..../exec
 *  8. Dán URL đó vào index.html, dòng FORM_ENDPOINT trong window.SASAKI_CONFIG
 *
 * LƯU Ý: mỗi lần sửa code phải Triển khai lại (chọn "Quản lý triển khai"
 * → sửa bản hiện có → Phiên bản: Mới) thì URL mới giữ nguyên.
 */

/* ══════════════ CẤU HÌNH ══════════════ */
var CAU_HINH = {
  TEN_SHEET: 'Lead',                              // tên tab trong Google Sheet
  EMAIL_SALES: 'mkt.1@orgencorp.vn',              // TODO: đổi thành email nhóm Sales
  EMAIL_CC: '',                                   // tùy chọn, cách nhau bằng dấu phẩy
  BAO_EMAIL_MOI_LEAD: true,                       // false = chỉ báo với lead đạt QL
  // Zalo OA — điền khi có token, để trống thì bỏ qua bước này
  ZALO_OA_TOKEN: '',
  ZALO_USER_ID: ''
};

/* ══════════════ CỘT DỮ LIỆU ══════════════
   Thứ tự cột khớp với sheet "Theo dõi" trong file Kế hoạch Master,
   để copy sang tổng hợp 3 ngày/lần không phải sắp xếp lại.
*/
var COT = [
  'Thời gian', 'Nhãn QL', 'Điểm QL', 'Ưu tiên',
  'Họ tên', 'Số điện thoại', 'Đơn vị', 'Vai trò',
  'Sản phẩm', 'Sản lượng', 'Loại hình', 'Đã có kho đông', 'Thời điểm đầu tư',
  'Kênh', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'gclid', 'fbclid', 'ttclid', 'Biến thể ngành', 'Trang giới thiệu',
  'Dữ liệu calculator', 'Ghi chú Sales', 'Trạng thái xử lý'
];

/**
 * Chạy tay 1 lần để tạo dòng tiêu đề + định dạng.
 */
function taoTieuDe() {
  var sheet = laySheet_();
  sheet.clear();
  sheet.getRange(1, 1, 1, COT.length).setValues([COT])
    .setFontWeight('bold')
    .setBackground('#1A1A1A')
    .setFontColor('#FFFFFF');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, COT.length);

  // Tô màu theo nhãn QL
  var dai = sheet.getRange(2, 2, sheet.getMaxRows() - 1, 1);
  var quyTac = [
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('QL')
      .setBackground('#DFF3E4').setFontColor('#1E7B34').setRanges([dai]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('CHUA_DU')
      .setBackground('#FFF1D6').setFontColor('#9A6B12').setRanges([dai]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('LOAI')
      .setBackground('#FBE0E4').setFontColor('#B0182F').setRanges([dai]).build()
  ];
  sheet.setConditionalFormatRules(quyTac);
  SpreadsheetApp.getUi().alert('Đã tạo tiêu đề. Giờ có thể Triển khai ứng dụng web.');
}

function laySheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CAU_HINH.TEN_SHEET);
  if (!sheet) sheet = ss.insertSheet(CAU_HINH.TEN_SHEET);
  return sheet;
}

/**
 * Suy ra tên kênh từ utm_source / click ID, để khớp 4 kênh trong sheet Theo dõi.
 */
function suyRaKenh_(d) {
  var src = String(d.utm_source || '').toLowerCase();
  if (d.gclid || src.indexOf('google') > -1) return 'Google Search';
  if (d.ttclid || src.indexOf('tiktok') > -1) return 'TikTok';
  if (src.indexOf('youtube') > -1 || src.indexOf('yt') === 0) return 'YouTube';
  if (d.fbclid || src.indexOf('facebook') > -1 || src.indexOf('fb') === 0 || src.indexOf('instagram') > -1) return 'Facebook/Instagram';
  if (src) return d.utm_source;
  return 'Trực tiếp / khác';
}

/**
 * Endpoint chính — landing page POST vào đây.
 */
function doPost(e) {
  var khoa = LockService.getScriptLock();
  try {
    khoa.waitLock(20000);

    var d = JSON.parse(e.postData.contents);

    // Bẫy bot: trường "website" phải rỗng
    if (d.website) {
      return ketQua_({ ok: true, bo_qua: 'bot' });
    }

    var sheet = laySheet_();
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, COT.length).setValues([COT]).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    var kenh = suyRaKenh_(d);
    var thoiGian = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');

    sheet.appendRow([
      thoiGian,
      d.nhan_ql || '', d.diem_ql || '', d.uu_tien || '',
      d.ho_ten || '', "'" + (d.so_dien_thoai || ''), d.don_vi || '', d.vai_tro || '',
      d.san_pham || '', d.san_luong || '', d.loai_hinh || '', d.kho_dong || '', d.thoi_diem || '',
      kenh,
      d.utm_source || '', d.utm_medium || '', d.utm_campaign || '', d.utm_content || '', d.utm_term || '',
      d.gclid || '', d.fbclid || '', d.ttclid || '', d.nganh_bien_the || '', d.trang_gioi_thieu || '',
      d.du_lieu_calculator || '', '', 'Chưa gọi'
    ]);

    guiEmail_(d, kenh, thoiGian);
    guiZalo_(d, kenh);

    return ketQua_({ ok: true });

  } catch (err) {
    console.error(err);
    return ketQua_({ ok: false, loi: String(err) });
  } finally {
    try { khoa.releaseLock(); } catch (e2) {}
  }
}

function doGet() {
  return ContentService
    .createTextOutput('Endpoint nhận lead của SASAKI Shock Freezer đang hoạt động.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function ketQua_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ══════════════ THÔNG BÁO EMAIL ══════════════ */
function guiEmail_(d, kenh, thoiGian) {
  if (!CAU_HINH.EMAIL_SALES) return;
  if (!CAU_HINH.BAO_EMAIL_MOI_LEAD && d.nhan_ql !== 'QL') return;

  var mau = { QL: '#1E7B34', CHUA_DU: '#9A6B12', LOAI: '#B0182F' };
  var chuThich = {
    QL: 'ĐẠT QUALIFIED LEAD (đủ cả 5 tiêu chí)',
    CHUA_DU: 'CHƯA ĐỦ (thiếu tiêu chí, cần gọi xác minh thêm)',
    LOAI: 'KHÔNG TÍNH (không phải doanh nghiệp / cơ sở sản xuất)'
  };
  var nhan = d.nhan_ql || 'CHUA_DU';

  var tieuDe = '[' + nhan + '] Lead mới: ' + (d.don_vi || d.ho_ten || 'chưa rõ') + ' · ' + (d.san_luong || '');

  function hang(k, v) {
    if (!v) return '';
    return '<tr><td style="padding:7px 14px;background:#FAFAFA;font-weight:600;width:170px">' + k +
           '</td><td style="padding:7px 14px">' + v + '</td></tr>';
  }

  var calc = '';
  if (d.du_lieu_calculator) {
    try {
      var c = JSON.parse(d.du_lieu_calculator);
      calc = c.kg_ngay + ' kg/ngày · giá ' + Number(c.gia_ban).toLocaleString('vi-VN') + ' đ/kg · ' +
             'hao hụt hiện tại ' + c.hao_hut_hien_tai + '% · ' +
             'ước tính giữ lại ' + Number(c.tien_giu_thang).toLocaleString('vi-VN') + ' đ/tháng';
    } catch (e) { calc = d.du_lieu_calculator; }
  }

  var html =
    '<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:640px">' +
      '<div style="background:' + (mau[nhan] || '#5C5C5C') + ';color:#fff;padding:16px 20px;border-radius:10px 10px 0 0">' +
        '<div style="font-size:13px;opacity:.85;letter-spacing:.08em">SASAKI SHOCK FREEZER · LEAD MỚI</div>' +
        '<div style="font-size:20px;font-weight:800;margin-top:4px">' + (chuThich[nhan] || nhan) + '</div>' +
        '<div style="font-size:14px;opacity:.9;margin-top:2px">Điểm: ' + (d.diem_ql || '') + ' · Ưu tiên gọi: ' + (d.uu_tien || '') + '</div>' +
      '</div>' +
      '<table style="width:100%;border-collapse:collapse;border:1px solid #EAEAEA;border-top:none;font-size:14.5px">' +
        hang('Họ tên', d.ho_ten) +
        hang('Điện thoại', '<a href="tel:' + (d.so_dien_thoai || '') + '"><b>' + (d.so_dien_thoai || '') + '</b></a>') +
        hang('Đơn vị', d.don_vi) +
        hang('Vai trò', d.vai_tro) +
        hang('Sản phẩm', d.san_pham) +
        hang('Sản lượng', d.san_luong) +
        hang('Loại hình', d.loai_hinh) +
        hang('Đã có kho đông', d.kho_dong) +
        hang('Thời điểm đầu tư', d.thoi_diem) +
        hang('Kênh', kenh) +
        hang('Campaign', d.utm_campaign) +
        hang('Biến thể ngành', d.nganh_bien_the) +
        hang('Đã tính hoàn vốn', calc) +
        hang('Thời gian', thoiGian) +
      '</table>' +
      '<p style="font-size:13px;color:#5C5C5C;margin-top:14px">' +
        'Nhãn do landing page chấm tự động theo 5 tiêu chí trong sheet “Đối tác &amp; Lead”. ' +
        'Sales có quyền chỉnh lại sau khi gọi. Nhớ cập nhật cột “Trạng thái xử lý” trong Google Sheet.' +
      '</p>' +
    '</div>';

  MailApp.sendEmail({
    to: CAU_HINH.EMAIL_SALES,
    cc: CAU_HINH.EMAIL_CC,
    subject: tieuDe,
    htmlBody: html
  });
}

/* ══════════════ THÔNG BÁO ZALO OA (tùy chọn) ══════════════ */
function guiZalo_(d, kenh) {
  if (!CAU_HINH.ZALO_OA_TOKEN || !CAU_HINH.ZALO_USER_ID) return;
  try {
    var noiDung =
      '[' + (d.nhan_ql || '') + '] Lead mới\n' +
      (d.don_vi || '') + ' - ' + (d.ho_ten || '') + '\n' +
      'SĐT: ' + (d.so_dien_thoai || '') + '\n' +
      (d.san_pham || '') + ' · ' + (d.san_luong || '') + '\n' +
      'Kênh: ' + kenh;

    UrlFetchApp.fetch('https://openapi.zalo.me/v3.0/oa/message/cs', {
      method: 'post',
      contentType: 'application/json',
      headers: { access_token: CAU_HINH.ZALO_OA_TOKEN },
      payload: JSON.stringify({
        recipient: { user_id: CAU_HINH.ZALO_USER_ID },
        message: { text: noiDung }
      }),
      muteHttpExceptions: true
    });
  } catch (e) {
    console.error('Lỗi gửi Zalo: ' + e);
  }
}

/**
 * Hàm test — chạy tay để kiểm tra trước khi bật quảng cáo.
 */
function chayThu() {
  var mau = {
    postData: {
      contents: JSON.stringify({
        ho_ten: 'Nguyễn Văn Test',
        so_dien_thoai: '0912345678',
        don_vi: 'Chuỗi cơm hộp ABC',
        vai_tro: 'Chủ doanh nghiệp / Giám đốc',
        san_pham: 'Thực phẩm chế biến',
        san_luong: '200-500 kg/ngày',
        loai_hinh: 'Chuỗi F&B / bếp trung tâm / nhà hàng',
        kho_dong: 'Đã có kho đông',
        thoi_diem: 'Trong 1-3 tháng tới',
        nhan_ql: 'QL', diem_ql: '5/5', uu_tien: 'Nong',
        utm_source: 'facebook', utm_campaign: 'cp2-fnb', fbclid: 'test123',
        nganh_bien_the: 'fnb',
        du_lieu_calculator: '{"kg_ngay":300,"gia_ban":180000,"hao_hut_hien_tai":10,"tien_giu_thang":84240000}'
      })
    }
  };
  var kq = doPost(mau);
  Logger.log(kq.getContent());
}
