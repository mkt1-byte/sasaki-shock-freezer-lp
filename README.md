# Landing Page — SASAKI Shock Freezer

Trang đích cho chiến dịch ra mắt máy cấp đông sâu **25/8 – 25/11/2026**.
KPI chiến dịch: **6 máy · 220tr ngân sách · 170 Qualified Lead**.

> **Nguyên tắc thiết kế:** trang này tối ưu **chất lượng QL**, không phải số lượng lead.
> Kế hoạch Master ghi rõ *"bán được máy, không dừng ở inbox"*, và ngân sách chu kỳ 2
> chỉ mở khi CK1 đạt 28 QL + 3 Opportunity trước 20/9. Lead rác làm trượt điều kiện đó.

---

## Cấu trúc

```
index.html              Landing page — 12 section
cam-on.html             Trang cảm ơn, là mốc chuyển đổi cho Google Ads (noindex)
assets/css/style.css    Design system theo Brand Guideline (60-30-10)
assets/js/app.js        Form đa bước · chấm điểm QL · calculator · tracking
assets/img/             Ảnh (trích từ PDF profile + logo/huy hiệu)
apps-script/Code.gs     Backend nhận lead → Google Sheet + email + Zalo
docs/ql-scoring.md      Quy tắc chấm QL — in gửi Sales
docs/utm-tracking.md    Chuẩn UTM + bảng sự kiện — gửi Thời
docs/checklist-claim.md Soát claim trước khi live
```

---

## Chạy thử tại máy

Trang là HTML tĩnh nhưng **cần chạy qua HTTP** (không mở trực tiếp bằng `file://`, vì `sessionStorage` và fetch sẽ không hoạt động đúng).

```bash
npx serve .
```

Không có Node thì dùng bất kỳ web server tĩnh nào, hoặc mở bằng Live Server của VS Code.

---

## Đưa lên live

Trang không cần backend, không cần database. Chọn một trong ba cách:

| Cách | Phù hợp khi | Ghi chú |
|---|---|---|
| **Hosting sẵn có** | Đã có hosting cho sasaki.com.vn | Upload cả thư mục vào subdomain, vd `capdong.sasaki.com.vn` |
| **Vercel / Netlify** | Muốn live trong 5 phút | Kéo thả thư mục vào giao diện web, miễn phí, có HTTPS sẵn |
| **Thư mục con của web hiện tại** | Muốn gộp chung tên miền | Đặt tại `/may-cap-dong-sau/`, khớp `canonical` đang set sẵn |

Sau khi có domain thật, sửa 3 chỗ trong `index.html`: thẻ `canonical`, `og:url`, và URL trong khối schema.

---

## Ba việc bắt buộc trước khi bật quảng cáo 25/8

### 1. Nối form vào Google Sheet — **ưu tiên số 1**

Chưa làm bước này thì **lead không được lưu ở đâu cả** (khách vẫn thấy trang cảm ơn, nhưng dữ liệu mất).

Làm theo hướng dẫn ở đầu file `apps-script/Code.gs` — khoảng 10 phút. Xong lấy URL `/exec` dán vào `FORM_ENDPOINT`.

### 2. Điền ID tracking

Mở `index.html`, sửa khối `window.SASAKI_CONFIG` ở phần `<head>`. Làm tương tự trong `cam-on.html`.

```js
window.SASAKI_CONFIG = {
  FORM_ENDPOINT: '',   // URL Apps Script — BẮT BUỘC
  HOTLINE: '0968723079',
  ZALO: 'https://zalo.me/0968723079',
  GA4_ID: '', FB_PIXEL_ID: '', GADS_ID: '', GADS_LABEL: '', TIKTOK_ID: ''
};
```

Đổi `HOTLINE` ở đây là đổi cả header, footer, thanh dính mobile — không phải sửa từng chỗ.

### 3. Soát claim

Chạy qua `docs/checklist-claim.md`. Brand Audit chấm mục này mức **Critical**.

---

## Bốn URL cho 4 campaign Facebook

Mỗi campaign dùng URL riêng để đổi hero, đổi tab và bóc tách được đ/QL:

```
?nganh=nha-may     CP1 — Nhà máy chế biến sẵn
?nganh=fnb         CP2 — Chuỗi F&B, bếp trung tâm
?nganh=thuy-san    CP3 — Thủy sản, thịt, nông sản
?nganh=rmk         CP4 — Remarketing
```

Chuẩn UTM đầy đủ: xem `docs/utm-tracking.md`.

---

## Thay video khi có

Ngày live 20/8 chỉ có V4 (VTV3). Các video còn lại đến sau và **không cần dựng lại trang** — mỗi ô video là một `<div data-video-slot="...">`, thay `<img>` bên trong bằng `<iframe>` là xong.

| Video | Có từ | Đặt ở đâu |
|---|---|---|
| V4 — VTV3 + nhà máy | 18/8 | Hero (`data-video-slot="V4"`) |
| V2 — Test thật, ăn thật | 30/8 | Section "Bài toán" — và lấy số liệu thật thay dải 8–12% |
| V3 — Tủ thường vs Shock Freezer | 3/9 | Section "Trước & Sau" |
| V1 — Hero 30 món ăn | 8/9 | Hero, thay V4 |
| V5 — Case study khách thật | 15/9 | Section "Case study" — bỏ ô chờ `data-o-cho` |

---

## Đã kiểm thử

Chạy trên trình duyệt thật, kết quả đạt:

- 12 section render đúng, không lỗi console, không ảnh hỏng
- Không tràn ngang ở desktop 1280 và mobile 375; bảng rộng cuộn trong khung riêng
- Calculator: đúng ở giá trị thường và ở biên (0 kg, 10.000 kg, hao hụt 0%, ngày 0) — không ra NaN/Infinity
- Form 4 bước: tự chuyển bước, xác thực từng bước, quay lại được, thanh tiến độ đúng
- Chấm điểm QL khớp cả 4 ví dụ trong sheet *Đối tác & Lead*
- Bắt đủ UTM + `gclid`/`fbclid`/`ttclid`, giữ qua chuyển trang
- Đổi kênh giữa phiên (Facebook → Google) không dính nguồn cũ
- 4 biến thể `?nganh=` đổi đúng hero và mở đúng tab
- Submit end-to-end tới `cam-on.html`, chào đúng tên, `noindex` đã set
- Schema JSON-LD hợp lệ: Organization · Product · BreadcrumbList · FAQPage (10 câu, khớp 10 câu trên trang)

---

## Hai điểm cần BLĐ chốt trước 20/8

1. **Hotline** — Playbook ghi `0968 723 079`, Brand Guideline slide 13 đánh dấu chưa rõ giữa số này và `0868 560 268 (CSKH)`. Trang đang dùng số của Playbook.
2. **Số năm** — 25 hay 26. Trang dùng **25 năm**. Lưu ý ảnh `thanh-tich-25-nam.jpg` có huy hiệu ghi "26 YEAR ANNIVERSARY" trong khi chữ lớn ghi "25 NĂM" — nên thay ảnh hoặc chốt lại con số.

Chi tiết: `docs/checklist-claim.md` mục 7.
