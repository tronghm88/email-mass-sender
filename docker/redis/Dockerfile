FROM redis:7-alpine

# Copy custom Redis configuration if needed
COPY docker/redis/redis.conf /usr/local/etc/redis/redis.conf

# Set Redis to run in the foreground
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
