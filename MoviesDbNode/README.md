# Movies DB
Web application with a database backend for storing and editing a movie collection

## Agile Board
An Agile Board for this exercise is available on Trello at https://trello.com/b/0HEmhdya/agile-board.

## Demo
Visit http://ec2-54-165-167-218.compute-1.amazonaws.com:3000/ to see the application in action.
Sign up with your email address to proceed into the application. From there you can view your movies (initially you have none), add, update, or delete movies in your collection.

## Tech Stack

### Cloud Hosting
The app is deployed on AWS EC2. I followed guidance provided at https://ourcodeworld.com/articles/read/977/how-to-deploy-a-node-js-application-on-aws-ec2-server.

### Back End
I am using Node.js + Express (https://expressjs.com/). This is a well-known, lightweight framework for building web applications. 

### Authentication
I am using Auth0 authentication via the Auth0 SDK (https://auth0.com/docs/quickstart/spa/vanillajs). 
Auth0 is a well-recognized authentication service with easy-to-implement access control, and it integrates easily with other parts of the application.

### Database
Local JSON storage; I just wanted to get things working and would like to replace it with something more conventional if time permits.

### Front End
HTML page built using the Pug template engine for Node.js + Express (https://pugjs.org/api/getting-started.html).
Simple implementation that afforded me the functionality I needed.
