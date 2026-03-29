FROM node:20

WORKDIR /app/SimpleNotesUI

COPY SimpleNotesUI/package*.json ./
RUN npm install --legacy-peer-deps

COPY app-version.json /app/app-version.json
COPY scripts/ /app/scripts/
COPY SimpleNotesUI/ .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
