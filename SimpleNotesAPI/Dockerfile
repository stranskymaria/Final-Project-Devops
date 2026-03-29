FROM node:20

WORKDIR /app/SimpleNotesAPI

COPY SimpleNotesAPI/package*.json ./
RUN npm install

COPY app-version.json /app/app-version.json
COPY scripts/ /app/scripts/
COPY SimpleNotesAPI/ .

EXPOSE 3001

CMD ["npm", "run", "dev"]
