# Quy tắc chấm điểm Qualified Lead

> Bản in cho Sales — gửi trước ngày bật quảng cáo 25/8
> Nguồn: sheet **Đối tác & Lead** trong `Ke_hoach_Master_ShockFreezer.xlsx`

Landing page tự chấm điểm mỗi lead ngay khi khách bấm gửi, rồi ghi nhãn vào Google Sheet và email báo về. Sales **không phải sàng thủ công** — chỉ cần xác minh lại khi gọi.

---

## 1. Năm tiêu chí (bám nguyên văn sheet)

Một lead **TÍNH là Qualified Lead khi đủ CẢ 5 điều**:

| # | Tiêu chí trong sheet | Trường trên landing page | Điều kiện đạt |
|---|---|---|---|
| 1 | Là DN, cơ sở sản xuất, chuỗi F&B hoặc có dự án thật | Bước 3 — *Loại hình đơn vị* | Khác `Cá nhân tìm hiểu` |
| 2 | Có sản phẩm cụ thể cần cấp đông | Bước 1 — *Sản phẩm* | Khác `Chưa xác định` |
| 3 | Có nhu cầu thật về sản xuất, bảo quản, đầu tư máy | Bước 3 — *Thời điểm đầu tư* | Đã chọn (bất kỳ mốc nào) |
| 4 | Nói được quy mô hoặc khối lượng cần xử lý | Bước 2 — *Sản lượng* | Khác `Chưa xác định` |
| 5 | Có người phụ trách để Sales làm việc tiếp | Bước 4 — *Họ tên + SĐT + Đơn vị* | Điền đủ cả ba |

---

## 2. Ba nhãn

| Nhãn | Điều kiện | Sales làm gì |
|---|---|---|
| **QL** | Đủ cả 5 tiêu chí | Gọi trong SLA. Tính vào cột QL của sheet Theo dõi. |
| **CHUA_DU** | Là doanh nghiệp nhưng thiếu tiêu chí | Gọi xác minh phần còn thiếu. Nếu bổ sung được → sửa nhãn thành QL. |
| **LOAI** | Không phải doanh nghiệp / cơ sở sản xuất | Không tính vào QL. Vẫn nên gọi ngắn nếu rảnh — có thể là nhân viên của DN thật điền nhầm. |

Điểm hiển thị dạng `n/5` để Sales biết thiếu ở đâu.

---

## 3. Vì sao "thời điểm đầu tư trên 6 tháng" vẫn tính QL

Sheet ghi rõ: *"kỹ thuật, R&D, purchasing của DN có dự án thật vẫn **TÍNH**, dù không phải người quyết định"*.

Một kỹ sư R&D nhà máy thủy sản đang tìm hiểu cho dự án năm sau **vẫn là QL** — họ có sản phẩm thật, quy mô thật, đơn vị thật. Thời điểm đầu tư chỉ dùng để **xếp thứ tự gọi**, không dùng để loại.

Vì vậy landing page tách riêng cột **Ưu tiên**:

| Ưu tiên | Thời điểm khách chọn |
|---|---|
| `Nong` | Trong tháng này · Trong 1–3 tháng tới |
| `Am` | Trong 3–6 tháng tới |
| `Nguoi` | Trên 6 tháng / đang tìm hiểu |

**Gọi theo thứ tự Nóng → Ấm → Nguội, nhưng đếm QL không phân biệt ưu tiên.**

---

## 4. Đối chiếu với ví dụ trong sheet

Đã chạy thử trực tiếp trên trang, kết quả khớp:

| Hồ sơ | Sheet nói | Trang chấm |
|---|---|---|
| Chủ chuỗi cơm hộp, 200 kg/ngày, muốn test mẫu | TÍNH | ✅ `QL` — 5/5, ưu tiên Nóng |
| Kỹ sư R&D nhà máy thủy sản hỏi thông số để báo cáo nội bộ | TÍNH | ✅ `QL` — 5/5, ưu tiên Nguội |
| Sinh viên hỏi giá làm báo cáo | KHÔNG | ✅ `LOAI` |
| Cá nhân hỏi máy làm đông trái cây tại nhà | KHÔNG | ✅ `LOAI` |
| Xưởng cơ khí inbox chào bán linh kiện | KHÔNG | ⚠️ xem mục 5 |

---

## 5. Điều trang **không** tự lọc được

Có hai nhóm trong sheet mà form không nhận ra, **Sales phải tự loại khi gọi**:

- **Nhà cung cấp chào hàng ngược, spam.** Họ có thể điền như một doanh nghiệp thật. Nhận ra khi gọi → sửa nhãn thành `LOAI` trong Google Sheet.
- **Hỏi chung chung, hỏi việc.** Nếu khách chọn loại hình doanh nghiệp nhưng thực chất chỉ hỏi cho biết.

> Nhãn tự động là **điểm khởi đầu, không phải phán quyết cuối cùng.** Sau khi gọi, Sales cập nhật lại cột **Nhãn QL** và **Trạng thái xử lý** trong Google Sheet. Số cuối kỳ lấy theo bản Sales đã xác minh.

---

## 6. Cách trang giảm lead rác ngay từ đầu

Ngoài chấm điểm, trang còn tự lọc bằng thiết kế:

- **Form 4 bước** — người tò mò bỏ giữa chừng, người có nhu cầu thật đi hết.
- **Bước 1 hỏi về sản phẩm, không xin số điện thoại** — giảm ma sát cho khách thật, không thu hút người điền bừa.
- **Copy nêu rõ 380V 3 pha, sản lượng theo mẻ, giá theo bài toán** — khách cá nhân tìm máy gia đình tự thấy không hợp. Khớp với danh sách từ khóa chặn *mini, gia đình, cũ, giá rẻ*.
- **Bẫy bot ẩn** — trường `website` vô hình, bot điền vào thì lead bị bỏ, không vào sheet.
- **Không hiện giá** — không kéo nhóm chỉ đi so giá.

---

## 7. Ở đâu xem số

- **Google Sheet** `SASAKI Shock Freezer — Lead 2026`, tab `Lead` — tô màu sẵn theo nhãn.
- **Email** báo từng lead, tiêu đề dạng `[QL] Lead mới: <Đơn vị> · <Sản lượng>`.
- **GA4 / Facebook** — sự kiện `gui_form` mang tham số `nhan_ql`, lọc được `nhan_ql = QL` để tính đ/QL từng kênh.

Cột trong Google Sheet đã sắp đúng thứ tự để copy sang sheet **Theo dõi** của file Kế hoạch Master mà không phải sắp lại.
