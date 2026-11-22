FROM node:22-slim

WORKDIR /emulator
RUN npm install -g firebase-tools@14.4.0 && npm cache clean --force
COPY firebase.json /emulator/firebase.json
COPY entrypoint.sh /emulator/entrypoint.sh
RUN sed -i 's/\r$//' /emulator/entrypoint.sh && chmod +x /emulator/entrypoint.sh && mkdir -p /emulator/data

EXPOSE 9099 4000
ENTRYPOINT ["/emulator/entrypoint.sh"]
