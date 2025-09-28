# backend/Dockerfile
FROM node:20-alpine
WORKDIR /app

# מתקינים דיפנדנסיז (dev + prod)
COPY package*.json ./
RUN npm install

# מעתיקים שאר הקוד (tsconfig, src וכו')
COPY . .

EXPOSE 3000

# מריצים את השרת ב-TypeScript עם רילואד
CMD ["npm", "run", "dev"]
