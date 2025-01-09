# Web Project 

## Description



## BACK END

Written in Nest

## FRONT END

Written in Angular


## Used commands


npm i -g @nestjs/cli

npm run start:dev 

nest new fr-administration

nest g module users
nest g controller users
nest g service users

curl http://localhost:3000/users 

CRUD :

curl -X POST -d 'firstname=Jane&lastname=Doe' http://localhost:3000/users/
curl http://localhost:3000/users
curl -X PUT -d 'firstname=Jane' http://localhost:3000/users/0
curl -X DELETE http://localhost:3000/users/0

