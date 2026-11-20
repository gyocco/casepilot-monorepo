FROM node:22-slim

WORKDIR /emulator
RUN npm install -g firebase-tools@14.4.0 && npm cache clean --force
COPY firebase.json /emulator/firebase.json

EXPOSE 9099 4000
CMD ["firebase", "emulators:start", "--only", "auth", "--project", "demo-casepilot-local"]
