# Sử dụng image Node.js chính thức
FROM node:18-alpine

# Tạo thư mục làm việc bên trong container
WORKDIR /app

# Sao chép package.json và cài đặt thư viện
COPY package*.json ./
RUN npm install --production

# Sao chép toàn bộ mã nguồn dự án vào container
COPY . .

# Mở cổng 3000 cho ứng dụng
EXPOSE 3000

# Lệnh khởi chạy ứng dụng
CMD ["node", "server.js"]