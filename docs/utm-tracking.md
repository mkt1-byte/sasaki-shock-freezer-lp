# Chuẩn UTM & đo lường

> Giao cho Thời (người chạy quảng cáo) · dùng trước ngày bật ads 25/8
> Mục đích: sheet **Theo dõi** trong file Kế hoạch Master điền được số theo **4 kênh × 31 kỳ 3 ngày**

---

## 1. Việc phải làm trước 25/8

| # | Việc | Ai | Xong khi |
|---|---|---|---|
| 1 | Deploy Google Apps Script, lấy URL `/exec` | Quỳnh | Dán vào `FORM_ENDPOINT` trong `index.html` |
| 2 | Cấp GA4 Measurement ID | Thời | Điền `GA4_ID` |
| ~~3~~ | ~~Cấp Facebook Pixel ID~~ | ~~Thời~~ | ✅ Đã điền `FB_PIXEL_ID` = `2474015673094064` (4/9) |
| 4 | Cấp Google Ads Conversion ID + Label | Thời | Điền `GADS_ID`, `GADS_LABEL` |
| 5 | Cấp TikTok Pixel ID | Thời | Điền `TIKTOK_ID` |
| ~~6~~ | ~~Chốt hotline chuẩn~~ | ~~BLĐ~~ | ✅ Đã chốt `0968 723 079` (3/9) |

Tất cả nằm **cùng một chỗ** — khối `window.SASAKI_CONFIG` ở đầu `index.html` và `cam-on.html`. Sửa 1 lần, áp cả trang.

```js
window.SASAKI_CONFIG = {
  FORM_ENDPOINT: '',   // URL Apps Script dạng https://script.google.com/macros/s/.../exec
  HOTLINE: '0968723079',
  ZALO: 'https://zalo.me/0968723079',
  GA4_ID: '',          // G-XXXXXXXXXX
  FB_PIXEL_ID: '',     // 15 chữ số
  GADS_ID: '',         // AW-XXXXXXXXX
  GADS_LABEL: '',      // nhãn chuyển đổi
  TIKTOK_ID: ''        // CXXXXXXXXXXXXXXXXXXX
};
```

> **Chưa điền ID vẫn chạy được** — trang không lỗi, chỉ là không có số. Chưa điền `FORM_ENDPOINT` thì lead ghi ra console và khách vẫn tới trang cảm ơn, nhưng **không vào Google Sheet**. Đây là việc ưu tiên số 1.

---

## 2. Chuẩn đặt UTM

Cú pháp cố định — **không tự đặt tên khác**, vì cột "Kênh" trong Google Sheet suy ra từ `utm_source`:

```
https://<domain>/?nganh=<bien-the>&utm_source=<kenh>&utm_medium=cpc&utm_campaign=<ma-campaign>&utm_content=<creative>
```

### `utm_source` — chỉ dùng đúng 4 giá trị này

| Kênh trong sheet Theo dõi | `utm_source` |
|---|---|
| Facebook / Instagram | `facebook` |
| Google Search | `google` |
| YouTube | `youtube` |
| TikTok | `tiktok` |

### `nganh` — biến thể nội dung theo 4 campaign Facebook

| Campaign | `nganh=` | Hero đổi thành |
|---|---|---|
| CP1 Nhà máy chế biến sẵn | `nha-may` | Chất lượng đồng đều giữa mọi lô sản xuất |
| CP2 Chuỗi F&B, bếp trung tâm | `fnb` | Nấu hôm nay, phục vụ tuần sau |
| CP3 Thủy sản, thịt, nông sản | `thuy-san` | Giữ trọng lượng, giữ phẩm cấp xuất khẩu |
| CP4 Remarketing | `rmk` | Đừng quyết định bằng catalogue |

Biến thể đổi **nhãn, tiêu đề, mô tả hero và mở sẵn đúng tab ứng dụng**. Không có tham số → hiển thị bản mặc định.

### `utm_campaign` — đề xuất đặt tên

```
cp1-nha-may      cp2-fnb      cp3-thuy-san      cp4-rmk
gg-mua-ngay      gg-nganh     gg-thuong-hieu
yt-trust         tiktok-test
```

### `utm_content` — để biết creative nào ra khách thật

Đặt theo video + phiên bản hook: `v4-hook1`, `v6-hook2`, `v8-hook1`, `v1-com-bun-pho`…

Đây là cột giúp trả lời câu hỏi của sheet Theo dõi: *"kênh nào ra khách thật"* — và mở rộng ra: **creative nào**.

### Ví dụ URL hoàn chỉnh

```
https://<domain>/?nganh=fnb&utm_source=facebook&utm_medium=cpc&utm_campaign=cp2-fnb&utm_content=v7-hook1
https://<domain>/?utm_source=google&utm_medium=cpc&utm_campaign=gg-mua-ngay
https://<domain>/?nganh=thuy-san&utm_source=facebook&utm_medium=cpc&utm_campaign=cp3-thuy-san&utm_content=v8-hook1
https://<domain>/?nganh=rmk&utm_source=facebook&utm_medium=cpc&utm_campaign=cp4-rmk&utm_content=v4-hook2
```

---

## 3. Trang tự bắt gì

Mỗi lead gửi đi mang theo, tự động, không cần khách khai:

`utm_source` · `utm_medium` · `utm_campaign` · `utm_content` · `utm_term` · `gclid` · `fbclid` · `ttclid` · `nganh_bien_the` · `trang_gioi_thieu`

Lưu trong `sessionStorage` nên **không mất khi khách chuyển trang hay quay lại**.

> **Quy ước last-touch.** Nếu khách click quảng cáo Facebook rồi sau đó click quảng cáo Google trong cùng phiên, trang **xóa sạch nguồn cũ** và ghi nguồn mới. Không trộn lẫn — nếu trộn, một lead sẽ vừa mang `utm_source=google` vừa dính `fbclid` cũ, làm sai đ/QL của cả hai kênh.

---

## 4. Bảng sự kiện

| Tên sự kiện | Bắn khi | GA4 | Facebook | TikTok |
|---|---|---|---|---|
| `xem_trang` | Tải trang | ✓ | PageView | page |
| `bat_dau_form` | Chạm vào form lần đầu | ✓ | InitiateCheckout | ✓ |
| `buoc_1` | Xong bước 1 (chọn sản phẩm) | ✓ | custom | ✓ |
| `buoc_2` | Xong bước 2 (chọn sản lượng) | ✓ | custom | ✓ |
| `buoc_3` | Xong bước 3 (loại hình) | ✓ | custom | ✓ |
| `gui_form` | Gửi thành công | ✓ | **Lead** | SubmitForm |
| `dung_calculator` | Đổi số trong máy tính hoàn vốn | ✓ | ViewContent | ✓ |
| `click_goi` | Bấm số hotline | ✓ | custom | ✓ |
| `click_zalo` | Bấm Zalo | ✓ | custom | ✓ |
| `xem_tab_nganh` | Đổi tab ứng dụng | ✓ | custom | ✓ |
| `cta_hero` / `cta_calculator` / `cta_sticky` | Bấm nút CTA | ✓ | custom | ✓ |

`gui_form` mang thêm tham số: `nhan_ql`, `diem_ql`, `san_pham`, `san_luong`.

**→ Trong GA4, lọc `gui_form` với `nhan_ql = QL` để ra đúng số QL, không phải lead thô.** Đây là con số dùng để tính đ/QL trong sheet Theo dõi.

---

## 5. Mốc chuyển đổi cho Google Ads

Dùng **trang đích `cam-on.html`** làm mốc chuyển đổi, không dùng event-only — ổn định hơn và không bị chặn bởi trình duyệt.

- Google Ads → Chuyển đổi → thêm mục tiêu Đích, URL chứa `cam-on`
- Trang này đã đặt `noindex, nofollow`, không lo ăn traffic tự nhiên
- Đồng thời trang cũng bắn `conversion` qua gtag nếu điền `GADS_ID` + `GADS_LABEL` (dùng một trong hai, đừng đếm trùng)

---

## 6. Ba con số cần theo mỗi kỳ 3 ngày

Theo đúng cột trong sheet Theo dõi:

1. **Chi tiêu** — lấy từ Ads Manager từng kênh
2. **QL** — GA4, lọc `gui_form` + `nhan_ql = QL`, tách theo `utm_source`
3. **đ/QL** — chia hai số trên

Nguyên tắc mở ngân sách trong kế hoạch: *"dồn tiền cho nhóm ra QL, Test, Opportunity tốt — không chạy theo view hay inbox rẻ."*

---

## 7. Kiểm tra trước khi bật tiền thật

Đã chạy và đạt trong lúc dựng — **làm lại sau khi điền ID thật**:

- [ ] Mở URL có UTM đầy đủ → gửi thử form → kiểm tra dòng mới trong Google Sheet có đủ cột nguồn
- [ ] Facebook Events Manager → Test Events → thấy `PageView` và `Lead`
- [ ] GA4 → Realtime → thấy `xem_trang`, `bat_dau_form`, `gui_form`
- [ ] Google Ads → chuyển đổi ghi nhận sau khi tới `cam-on.html`
- [ ] Thử kịch bản đổi kênh giữa phiên (Facebook → Google) → nguồn phải sạch, không dính `fbclid` cũ
- [ ] Thử trên điện thoại thật, mạng 4G — bấm Gọi và Zalo ở thanh dính dưới màn hình
