/* ============================================================
   SASAKI Shock Freezer — Landing Page
   Form đa bước · Chấm điểm QL · Máy tính hoàn vốn · Tracking
   Xem docs/ql-scoring.md và docs/utm-tracking.md
   ============================================================ */
(function () {
  'use strict';

  var CF = window.SASAKI_CONFIG || {};
  var KHOA_NGUON = 'sasaki_nguon';

  /* ---------- Tiện ích ---------- */
  function $(sel, goc) { return (goc || document).querySelector(sel); }
  function $$(sel, goc) { return Array.prototype.slice.call((goc || document).querySelectorAll(sel)); }

  var dinhDangSo = new Intl.NumberFormat('vi-VN');

  function tienNgan(d) {
    if (!isFinite(d) || d <= 0) return '0 đ';
    if (d >= 1e9) return (d / 1e9).toFixed(d >= 1e10 ? 0 : 1).replace('.', ',') + ' tỷ đ';
    if (d >= 1e6) return Math.round(d / 1e6).toLocaleString('vi-VN') + ' triệu đ';
    return dinhDangSo.format(Math.round(d)) + ' đ';
  }

  function soAnToan(el, mac_dinh) {
    var v = parseFloat(el && el.value);
    return isFinite(v) && v >= 0 ? v : (mac_dinh || 0);
  }

  /* ============================================================
     1. TRACKING — nạp pixel, gửi sự kiện
     ============================================================ */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  function napScript(src) {
    var s = document.createElement('script');
    s.async = true; s.src = src;
    document.head.appendChild(s);
  }

  // GA4
  if (CF.GA4_ID) {
    napScript('https://www.googletagmanager.com/gtag/js?id=' + CF.GA4_ID);
    gtag('js', new Date());
    gtag('config', CF.GA4_ID);
    if (CF.GADS_ID) gtag('config', CF.GADS_ID);
  }

  // Facebook Pixel
  if (CF.FB_PIXEL_ID) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', CF.FB_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  // TikTok Pixel
  if (CF.TIKTOK_ID) {
    !function (w, d, t) {
      w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
      ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
      ttq.setAndDefer = function (o, m) { o[m] = function () { o.push([m].concat(Array.prototype.slice.call(arguments, 0))); }; };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.load = function (e) {
        var s = 'https://analytics.tiktok.com/i18n/pixel/events.js';
        ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = s; ttq._t = ttq._t || {}; ttq._t[e] = +new Date();
        var o = d.createElement('script'); o.type = 'text/javascript'; o.async = !0; o.src = s + '?sdkid=' + e + '&lib=' + t;
        var a = d.getElementsByTagName('script')[0]; a.parentNode.insertBefore(o, a);
      };
      ttq.load(CF.TIKTOK_ID); ttq.page();
    }(window, document, 'ttq');
  }

  /**
   * Bắn 1 sự kiện ra mọi nền tảng đang bật.
   * Tên sự kiện tiếng Việt không dấu — xem bảng đối chiếu trong docs/utm-tracking.md
   */
  function banSuKien(ten, duLieu) {
    duLieu = duLieu || {};
    try { gtag('event', ten, duLieu); } catch (e) {}
    try {
      if (window.fbq) {
        var chuan = { gui_form: 'Lead', bat_dau_form: 'InitiateCheckout', dung_calculator: 'ViewContent' };
        if (chuan[ten]) window.fbq('track', chuan[ten], duLieu);
        else window.fbq('trackCustom', ten, duLieu);
      }
    } catch (e) {}
    try { if (window.ttq) window.ttq.track(ten === 'gui_form' ? 'SubmitForm' : ten, duLieu); } catch (e) {}
  }
  window.banSuKien = banSuKien;

  /* ============================================================
     2. BẮT NGUỒN QUẢNG CÁO (UTM + click ID)
     Lưu vào sessionStorage để không mất khi khách chuyển trang.
     ============================================================ */
  var TRUONG_NGUON = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'ttclid'];

  function layNguon() {
    var luu = {};
    try { luu = JSON.parse(sessionStorage.getItem(KHOA_NGUON) || '{}'); } catch (e) { luu = {}; }

    var qs = new URLSearchParams(window.location.search);

    // Lượt truy cập này có mang tham số quảng cáo nào không?
    var coThamSoMoi = TRUONG_NGUON.some(function (k) { return !!qs.get(k); });

    if (coThamSoMoi) {
      // ĐÂY LÀ MỘT LƯỢT CLICK QUẢNG CÁO MỚI.
      // Phải XÓA SẠCH nguồn cũ rồi mới ghi nguồn mới — nếu chỉ ghi đè từng trường,
      // một khách click quảng cáo Facebook rồi sau đó click quảng cáo Google trong
      // cùng phiên sẽ bị gán utm_source=google nhưng vẫn dính utm_campaign và fbclid
      // của Facebook. Lead đó vào sheet Theo dõi sẽ tính sai đ/QL cho cả hai kênh.
      // Quy ước: last-touch — lượt click gần nhất là nguồn được ghi nhận.
      var giuLai = luu.trang_gioi_thieu;
      luu = {};
      TRUONG_NGUON.forEach(function (k) {
        var v = qs.get(k);
        if (v) luu[k] = v;
      });
      luu.trang_gioi_thieu = giuLai || document.referrer || 'truc-tiep';
      try { sessionStorage.setItem(KHOA_NGUON, JSON.stringify(luu)); } catch (e) {}
      return luu;
    }

    // Không có tham số quảng cáo — giữ nguyên nguồn đã lưu (khách quay lại, chuyển trang)
    if (!luu.trang_gioi_thieu) {
      luu.trang_gioi_thieu = document.referrer || 'truc-tiep';
      try { sessionStorage.setItem(KHOA_NGUON, JSON.stringify(luu)); } catch (e) {}
    }
    return luu;
  }

  var NGUON = layNguon();

  /* ============================================================
     3. BIẾN THỂ THEO NGÀNH (?nganh=)  — message-match 4 campaign
     ============================================================ */
  var BIEN_THE = {
    'nha-may': {
      nhan: 'Dành cho nhà máy chế biến thực phẩm',
      tieuDe: 'Chất lượng đồng đều<br><em>giữa mọi lô sản xuất</em>',
      moTa: 'Cấp đông sâu siêu tốc ngay sau chế biến: buồng đến <b>−65°C</b>, hạ tâm tới <b>−40°C</b>. Giảm chênh lệch giữa các mẻ, giảm phản ánh chất lượng sau rã đông, chủ động kế hoạch sản xuất không phụ thuộc mùa vụ.',
      tab: 'nha-may'
    },
    'fnb': {
      nhan: 'Dành cho chuỗi F&B và bếp trung tâm',
      tieuDe: 'Nấu hôm nay,<br><em>phục vụ tuần sau</em>',
      moTa: 'Món chế biến chín sau khi cấp đông sâu và hoàn nhiệt đúng cách vẫn giữ được độ ngọt, mùi thơm và cấu trúc. Bếp trung tâm nấu tập trung một lần, phân phối nhiều ngày — vị đồng nhất trên toàn chuỗi.',
      tab: 'fnb'
    },
    'thuy-san': {
      nhan: 'Dành cho thủy sản, thịt và nông sản giá trị cao',
      tieuDe: 'Giữ trọng lượng,<br><em>giữ phẩm cấp xuất khẩu</em>',
      moTa: 'Hạ tâm tới <b>−40°C</b> đáp ứng yêu cầu siêu đông cho sashimi và hàng xuất khẩu. Hạn chế dịch chảy khi rã đông đồng nghĩa giữ được khối lượng bán ra — và giữ màu, giữ độ săn chắc.',
      tab: 'thuy-san'
    },
    'rmk': {
      nhan: 'Test mẫu miễn phí trên chính sản phẩm của bạn',
      tieuDe: 'Đừng quyết định<br><em>bằng catalogue</em>',
      moTa: 'Mỗi loại thực phẩm cần một quy trình cấp đông khác nhau. Cách duy nhất để biết máy hợp với sản phẩm của bạn là <b>test thật</b> — có đo chỉ tiêu, có báo cáo, trước khi bàn tới cấu hình và giá.',
      tab: 'nha-may'
    }
  };

  var nganh = new URLSearchParams(window.location.search).get('nganh') || '';
  if (BIEN_THE[nganh]) {
    var bt = BIEN_THE[nganh];
    var elNhan = $('[data-nganh-nhan]'), elTieuDe = $('[data-nganh-tieu-de]'), elMoTa = $('[data-nganh-mo-ta]');
    if (elNhan) elNhan.textContent = bt.nhan;
    if (elTieuDe) elTieuDe.innerHTML = bt.tieuDe;
    if (elMoTa) elMoTa.innerHTML = bt.moTa;
  }

  /* ============================================================
     4. TAB ỨNG DỤNG THEO NGÀNH
     ============================================================ */
  function moTab(ten) {
    $$('.tab-nut button').forEach(function (b) {
      b.setAttribute('aria-selected', String(b.dataset.tab === ten));
    });
    $$('.tab-bang').forEach(function (p) {
      var khop = p.id === 'tab-' + ten;
      p.classList.toggle('hien', khop);
      if (khop) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
    });
  }

  $$('.tab-nut button').forEach(function (b) {
    b.addEventListener('click', function () {
      moTab(b.dataset.tab);
      banSuKien('xem_tab_nganh', { tab: b.dataset.tab });
    });
  });

  // Mở đúng tab theo biến thể chiến dịch
  if (BIEN_THE[nganh]) moTab(BIEN_THE[nganh].tab);

  /* ============================================================
     5. MÁY TÍNH HOÀN VỐN
     ============================================================ */
  var mtSanLuong = $('#mt-san-luong'), mtSanLuongTruot = $('#mt-san-luong-truot');
  var mtGia = $('#mt-gia'), mtHaoHut = $('#mt-hao-hut'), mtHaoHutTruot = $('#mt-hao-hut-truot');
  var mtNgay = $('#mt-ngay'), mtMucTieu = $('#mt-muc-tieu');
  var duLieuCalc = null;

  function goiYCongSuat(kgNgay) {
    // Giả định thận trọng: ~6 mẻ dùng được mỗi ngày (mỗi mẻ ~1 giờ + ra/vào hàng)
    if (kgNgay <= 0) return '—';
    if (kgNgay <= 300) return 'Dòng 50 kg/mẻ';
    if (kgNgay <= 600) return 'Dòng 100 kg/mẻ';
    if (kgNgay <= 1200) return 'Dòng 200 kg/mẻ';
    return 'Cần khảo sát riêng';
  }

  function tinhHoanVon() {
    if (!mtSanLuong) return;

    var kgNgay = soAnToan(mtSanLuong, 0);
    var gia = soAnToan(mtGia, 0);
    var haoHutHienTai = Math.min(soAnToan(mtHaoHut, 0), 100);
    var ngay = Math.min(Math.max(soAnToan(mtNgay, 26), 1), 31);
    var mucTieu = soAnToan(mtMucTieu, 4);

    var kgThang = kgNgay * ngay;
    var chenhLech = Math.max(haoHutHienTai - mucTieu, 0) / 100;

    var kgMat = kgThang * (haoHutHienTai / 100);
    var kgGiu = kgThang * chenhLech;
    var tienThang = kgGiu * gia;
    var tienNam = tienThang * 12;

    $('#kq-mat').textContent = dinhDangSo.format(Math.round(kgMat)) + ' kg';
    $('#kq-giu').textContent = dinhDangSo.format(Math.round(kgGiu)) + ' kg';
    $('#kq-tien-thang').textContent = tienNgan(tienThang);
    $('#kq-tien-nam').textContent = tienNgan(tienNam);
    $('#kq-cong-suat').textContent = goiYCongSuat(kgNgay);

    duLieuCalc = {
      kg_ngay: kgNgay, gia_ban: gia, hao_hut_hien_tai: haoHutHienTai,
      ngay_sx: ngay, hao_hut_muc_tieu: mucTieu,
      kg_giu_thang: Math.round(kgGiu), tien_giu_thang: Math.round(tienThang)
    };
    var oCalc = $('#f_calc');
    if (oCalc) oCalc.value = JSON.stringify(duLieuCalc);
  }

  // Đồng bộ ô nhập ↔ thanh trượt
  function noiDoi(oNhap, oTruot) {
    if (!oNhap || !oTruot) return;
    oNhap.addEventListener('input', function () { oTruot.value = oNhap.value; tinhHoanVon(); });
    oTruot.addEventListener('input', function () { oNhap.value = oTruot.value; tinhHoanVon(); });
  }
  noiDoi(mtSanLuong, mtSanLuongTruot);
  noiDoi(mtHaoHut, mtHaoHutTruot);
  [mtGia, mtNgay, mtMucTieu].forEach(function (el) {
    if (el) el.addEventListener('input', tinhHoanVon);
  });

  // Bắn sự kiện 1 lần khi khách thực sự dùng calculator
  var daBanCalc = false;
  [mtSanLuong, mtSanLuongTruot, mtGia, mtHaoHut, mtHaoHutTruot, mtNgay, mtMucTieu].forEach(function (el) {
    if (!el) return;
    el.addEventListener('change', function () {
      if (daBanCalc) return;
      daBanCalc = true;
      banSuKien('dung_calculator', duLieuCalc || {});
    });
  });

  tinhHoanVon();

  /* ============================================================
     6. FORM ĐA BƯỚC + CHẤM ĐIỂM QUALIFIED LEAD
     Quy tắc bám sát sheet "Đối tác & Lead" — xem docs/ql-scoring.md
     ============================================================ */
  var form = $('#form-lead');

  if (form) {
    var TONG_BUOC = 4;
    var buocHienTai = 1;
    var daBatDau = false;

    var LOAI_HINH_CA_NHAN = 'Cá nhân tìm hiểu';

    function veBuoc(n) {
      buocHienTai = n;
      $$('.buoc', form).forEach(function (b) {
        b.classList.toggle('hien', Number(b.dataset.buoc) === n);
      });
      $$('.tien-do__o', form).forEach(function (o, i) {
        o.classList.toggle('xong', i < n);
      });
      $('#buoc-hien-tai').textContent = String(n);
      $$('.loi', form).forEach(function (l) { l.classList.remove('hien'); });

      // Cuộn form vào tầm nhìn khi đổi bước (trừ lần đầu)
      var hop = $('.form-hop');
      if (hop && n > 1) {
        var y = hop.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }

    function hienLoi(n, thongDiep) {
      var el = $('.loi[data-loi="' + n + '"]', form);
      if (!el) return;
      if (thongDiep) el.textContent = thongDiep;
      el.classList.add('hien');
    }

    function giaTriRadio(ten) {
      var el = form.querySelector('input[name="' + ten + '"]:checked');
      return el ? el.value : '';
    }

    function hopLeSdt(sdt) {
      var so = String(sdt || '').replace(/[^\d+]/g, '');
      return /^(0|\+?84)[1-9]\d{8}$/.test(so) || /^0\d{9,10}$/.test(so);
    }

    function kiemTraBuoc(n) {
      if (n === 1) {
        if (!giaTriRadio('san_pham')) { hienLoi(1); return false; }
      }
      if (n === 2) {
        if (!giaTriRadio('san_luong')) { hienLoi(2); return false; }
      }
      if (n === 3) {
        if (!$('#loai_hinh').value || !$('#thoi_diem').value) { hienLoi(3); return false; }
      }
      if (n === 4) {
        var ten = $('#ho_ten').value.trim();
        var sdt = $('#so_dien_thoai').value.trim();
        var dv = $('#don_vi').value.trim();
        if (ten.length < 2 || !dv) {
          hienLoi(4, 'Vui lòng nhập họ tên và tên đơn vị.');
          return false;
        }
        if (!hopLeSdt(sdt)) {
          hienLoi(4, 'Số điện thoại chưa đúng định dạng. Ví dụ: 0968 723 079');
          return false;
        }
      }
      return true;
    }

    /**
     * Chấm điểm theo 5 tiêu chí QL của sheet "Đối tác & Lead".
     * QL = đủ CẢ 5 điều. Trả về { diem, nhan, uu_tien, chi_tiet }
     */
    function chamDiemQL() {
      var sanPham = giaTriRadio('san_pham');
      var sanLuong = giaTriRadio('san_luong');
      var loaiHinh = $('#loai_hinh').value;
      var thoiDiem = $('#thoi_diem').value;
      var vaiTro = $('#vai_tro').value;

      var ct = {
        // TC1 — là DN, cơ sở sản xuất, chuỗi F&B hoặc có dự án thật
        la_doanh_nghiep: !!loaiHinh && loaiHinh !== LOAI_HINH_CA_NHAN,
        // TC2 — có sản phẩm cụ thể cần cấp đông
        co_san_pham: !!sanPham && sanPham !== 'Chưa xác định',
        // TC3 — có nhu cầu thật về sản xuất, bảo quản, đầu tư
        co_nhu_cau: !!thoiDiem,
        // TC4 — nói được quy mô hoặc khối lượng cần xử lý
        co_quy_mo: !!sanLuong && sanLuong !== 'Chưa xác định',
        // TC5 — có người phụ trách để Sales làm việc tiếp
        co_nguoi_phu_trach: !!$('#ho_ten').value.trim() && !!$('#so_dien_thoai').value.trim() && !!$('#don_vi').value.trim()
      };

      var diem = Object.keys(ct).reduce(function (t, k) { return t + (ct[k] ? 1 : 0); }, 0);

      var nhan;
      if (!ct.la_doanh_nghiep) nhan = 'LOAI';        // cá nhân tò mò, không có dự án
      else if (diem === 5) nhan = 'QL';
      else nhan = 'CHUA_DU';

      // Độ ưu tiên gọi — tách khỏi định nghĩa QL, chỉ để Sales xếp thứ tự
      var uuTien = 'Nguoi';
      if (thoiDiem === 'Trong tháng này') uuTien = 'Nong';
      else if (thoiDiem === 'Trong 1 – 3 tháng tới') uuTien = 'Nong';
      else if (thoiDiem === 'Trong 3 – 6 tháng tới') uuTien = 'Am';

      return { diem: diem, nhan: nhan, uu_tien: uuTien, chi_tiet: ct, vai_tro: vaiTro };
    }

    // Điều hướng bước
    $$('[data-tiep]', form).forEach(function (b) {
      b.addEventListener('click', function () {
        if (!kiemTraBuoc(buocHienTai)) return;
        if (buocHienTai < TONG_BUOC) {
          veBuoc(buocHienTai + 1);
          banSuKien('buoc_' + buocHienTai, {});
        }
      });
    });

    $$('[data-lui]', form).forEach(function (b) {
      b.addEventListener('click', function () {
        if (buocHienTai > 1) veBuoc(buocHienTai - 1);
      });
    });

    // Bắn sự kiện khi khách bắt đầu tương tác với form
    form.addEventListener('change', function () {
      if (daBatDau) return;
      daBatDau = true;
      banSuKien('bat_dau_form', {});
    }, { once: false });

    // Chọn xong bước 1 & 2 thì tự sang bước tiếp — giảm ma sát
    $$('input[name="san_pham"]', form).forEach(function (r) {
      r.addEventListener('change', function () {
        setTimeout(function () { if (buocHienTai === 1) { veBuoc(2); banSuKien('buoc_1', {}); } }, 220);
      });
    });
    $$('input[name="san_luong"]', form).forEach(function (r) {
      r.addEventListener('change', function () {
        setTimeout(function () { if (buocHienTai === 2) { veBuoc(3); banSuKien('buoc_2', {}); } }, 220);
      });
    });

    // Gửi form
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!kiemTraBuoc(4)) return;

      // Bẫy bot — bot điền hết mọi trường
      if ($('#f_honeypot').value) return;

      var ql = chamDiemQL();

      // Đổ nguồn quảng cáo vào trường ẩn
      TRUONG_NGUON.forEach(function (k) {
        var el = $('#f_' + k);
        if (el) el.value = NGUON[k] || '';
      });
      $('#f_nganh').value = nganh || '';
      $('#f_referrer').value = NGUON.trang_gioi_thieu || '';
      $('#f_diem_ql').value = ql.diem + '/5';
      $('#f_nhan_ql').value = ql.nhan;

      var duLieu = {};
      new FormData(form).forEach(function (v, k) { duLieu[k] = v; });
      duLieu.uu_tien = ql.uu_tien;
      duLieu.thoi_gian = new Date().toISOString();
      duLieu.trang = window.location.href;

      var nut = $('#nut-gui');
      nut.disabled = true;
      nut.textContent = 'Đang gửi...';

      banSuKien('gui_form', {
        nhan_ql: ql.nhan,
        diem_ql: ql.diem,
        san_pham: duLieu.san_pham,
        san_luong: duLieu.san_luong,
        value: ql.nhan === 'QL' ? 1 : 0,
        currency: 'VND'
      });

      // Chuyển đổi Google Ads
      if (CF.GADS_ID && CF.GADS_LABEL) {
        try { gtag('event', 'conversion', { send_to: CF.GADS_ID + '/' + CF.GADS_LABEL }); } catch (err) {}
      }

      function xong() {
        try { sessionStorage.setItem('sasaki_lead', JSON.stringify({ nhan: ql.nhan, ten: duLieu.ho_ten })); } catch (err) {}
        window.location.href = 'cam-on.html';
      }

      if (!CF.FORM_ENDPOINT) {
        // Chưa cấu hình endpoint — vẫn cho khách qua trang cảm ơn, ghi log để dev biết
        console.warn('[SASAKI] Chưa cấu hình FORM_ENDPOINT trong index.html. Dữ liệu lead:', duLieu);
        xong();
        return;
      }

      fetch(CF.FORM_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(duLieu)
      }).then(xong).catch(function (err) {
        console.error('[SASAKI] Lỗi gửi form:', err);
        xong(); // không chặn khách vì lỗi mạng — lead vẫn có trong GA4/Pixel
      });
    });
  }

  /* ============================================================
     7. SỰ KIỆN CLICK GỌI / ZALO / CTA
     ============================================================ */
  $$('[data-su-kien]').forEach(function (el) {
    el.addEventListener('click', function () {
      banSuKien(el.dataset.suKien, { vi_tri: el.textContent.trim().slice(0, 40) });
    });
  });

  /* ============================================================
     8. ÁP SỐ HOTLINE / ZALO TỪ CONFIG (đổi 1 chỗ, đổi cả trang)
     ============================================================ */
  if (CF.HOTLINE) {
    var hienThi = CF.HOTLINE.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3');
    $$('a[href^="tel:"]').forEach(function (a) {
      a.setAttribute('href', 'tel:' + CF.HOTLINE);
      if (/^[\d\s.]+$/.test(a.textContent.trim())) a.textContent = hienThi;
      var b = a.querySelector('b');
      if (b && /^[\d\s.]+$/.test(b.textContent.trim())) b.textContent = hienThi;
    });
  }
  if (CF.ZALO) {
    $$('a[href*="zalo.me"]').forEach(function (a) { a.setAttribute('href', CF.ZALO); });
  }

  /* ============================================================
     9. XEM TRANG
     ============================================================ */
  banSuKien('xem_trang', {
    nganh_bien_the: nganh || 'mac-dinh',
    utm_source: NGUON.utm_source || '',
    utm_campaign: NGUON.utm_campaign || ''
  });

})();
