# HOME TEST – MIDDLE REACT DEVELOPER

**Đề bài:** Xây dựng một **React Component quản lý lịch làm việc theo dạng Time Blocking**, cho phép người dùng tạo và quản lý các công việc (Event) trên lịch.

Tham khảo giao diện tại:
gcal_7days.png

*Không yêu cầu giao diện giống hoàn toàn, chỉ cần đảm bảo các chức năng chính.*

## Yêu cầu

1. Các việc (Event) bao gồm tiêu đề (title), mô tả (description), thời gian bắt đầu (start date time), thời gian kết thúc (end date time).
   - Thời gian bao gồm cả ngày + thời gian (Không có all-day event).
2. Khoảng thời gian hiển thị là 7 ngày tính từ thời điểm hiện tại.
3. Khi kéo và thả trên một đoạn thời gian trống, hiện dialog cho phép tạo mới Event.
4. Khi kéo, thả Event, update lại thời gian của Event cho đúng với đoạn thời gian mới.
5. Khi click chuột trái vào Event hiện dialog mô tả Event.
6. Khi click chuột phải vào Event hiện context menu, gồm 2 action là Sửa (Edit) và Xóa (Delete).
   - Nếu chọn sửa, hiện dialog cho phép sửa Event.
   - Nếu chọn xóa, thực hiện xóa Event.

## Lưu ý

- Sử dụng Typescript để cài đặt.
- Không sử dụng bất kỳ thư viện bên ngoài nào.
- Được sử dụng Tailwind-Css cho việc style.
- Source code phân tách các component nhỏ gọn, dễ hiểu.

## Gửi kết quả

- Nộp bài trong vòng **5 ngày kể từ ngày gửi bài test.**
- Source code đẩy lên **Github**, deploy component như một app và cung cấp **Public URL**.