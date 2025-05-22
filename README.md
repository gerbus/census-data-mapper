### Running the server locally
1. yarn
2. yarn start

### Deploying Changes to production
1. git push origin main
2. ssh into the server
3. cd gerbus.ca/node/census-data-mapper
4. sudo git pull
5. service census-data-mapper.gerbus.ca restart