# 1. Use an official Node.js image as a base
FROM node:22

# 2. Set working directory inside the container
WORKDIR /app

# 3. Copy package.json and yarn.lock (to install dependencies separately)
COPY package.json yarn.lock ./

# 4. Install dependencies
RUN yarn install --frozen-lockfile

COPY .env.public .env

# 5. Copy the rest of the application files
COPY . .

# 6. Build the Next.js application
RUN yarn gc
RUN yarn build

# 7. Expose the port Next.js runs on
EXPOSE 3000

# 8. Start the application
CMD ["yarn", "start"]
