# Photo Battle

This is a demo Express.js web application that allows users to vote on images in a single-elimination style tournament. Main key features:
- Versus system that allows users to choose between photos and decide the winner.
- Public page that shows the last 50 tournament champions.
- Simple user registration requirement for visitors to allow them to complete tournaments and display their names alongside their winning photo on the Champions page.
- Fetch photos from a proprietary image url. **Url not included in repository for privacy reasons.**

## Building the project
Requirements: Node.js v12 and sqlite3
1. Clone the repository and install dependencies.
```bash
$ cd ./PhotoBattle
$ npm install
```
2. Create the database file using sqlite3 and run the contents of `schema.sqlite`
```bash
$ sqlite3 app.db < schema.sqlite
```
3. Create your config file and fill in the required values.
```bash
$ cp config.example.js config.js
$ nano config.js
```
4. Run the project
```bash
$ npm start
```