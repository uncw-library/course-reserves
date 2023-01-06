## What the app does

This app displays course reserves.

## Building a production image

- After you're happy with your code changes:
```
docker login libapps-admin.uncw.edu:8000
docker build --no-cache -t libapps-admin.uncw.edu:8000/randall-dev/course-reserves .
docker push libapps-admin.uncw.edu:8000/randall-dev/course-reserves
```

## Running a dev box

Create a file at ./course-reserves/.env

```
SIERRA_USER=YourSierraUsername
SIERRA_PASS=YourSierraPassword
NODE_ENV=development
```

- `docker-compose up -d`

Connect to uncw VPN & see the app at localhost:3000

- `docker-compose down` to stop it

To add a new package, run `npm install {{whatever}}` on your local computer to add that requirement to package.json.  Running 

```
docker-compose down
docker-compose up --build -d
```

To revise the app, revised the code in the ./app folder.  Nodemon inside the container will auto-reload the app whenever you revise ./app.  This works because the ./app folder on your local computer is volume mounted inside the container.  Any revisions to ./app is reflected inside container.

Push any code changes to gitlab.
