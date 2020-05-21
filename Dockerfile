FROM node:10

# Add package file
COPY . .
ENV AWS_ACCESS_KEY_ID=xxx
ENV AWS_SECRET_ACCESS_KEY=xxx
ENV AWS_REGION=eu-west-1
# Install deps
RUN npm i

# Copy source

EXPOSE 3000
# Build dist
CMD ["npm","run","dev"]

# Expose port 3000













