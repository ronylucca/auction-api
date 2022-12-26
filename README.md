<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Description

This is a backend [Nest](https://github.com/nestjs/nest) project using Prisma ORM to database migrations

This project is part of [Auction Contracts](https://github.com/ronylucca/auction-contracts) and it is a backend API that uses Alchemy node services to integrate a blockchain smart contract(Auction)
This was developed mainly to improve some skills like typescript, to interact with Prisma and of course face blockchain integrations

API's are documented using Swagger

The ADMIN_WALLET key is the same as used to deploy the Auction smart contract

I generated a new wallet and set it on env file to facilitate the tests. This wallet was used to deploy an Auction smart contract as well. So they are good to just run, migrate db and test thought Swagger.

## Installation

```bash
$ npm install
```

### Then to sync your database with Prisma migrations type:

```
npx prisma migrate dev
```

### Running the app

```bash
# watch mode
$ npm run start:dev

```

### These are the full cycle steps to test an Auction

- [POST] /product : to create a Product instance by contract persisting a Product on db. The contract also will mint a AUCT token for the administration address set on .env

- [POST] /auction/initialize : actually initialize an Auction. Persists it on DB and update the struct on blockchain setting it to Bid.

- [GET] /auction/blockchain/{id} : retrieves the Auction object struct content from blockchain using the Auction Id saved on DB. This one contains tokenId, seller address, bidder address, lastBid, bidPosition and isListed

- [POST] /bid : create a Bid instance on DB to represents this action. When an auction reaches up to a specific number of bids the contract evaluate the bestBid and transfer the NFT Token from Administration Address to the Bidder winner address. Also, a ListPrice amount of 0.0001 ether is transferred to the seller. This amount is payed on initialize an auction.

- BidMaxNumber:
  [POST] /blockchain/max-bid-number: used to update maximum number of bid for an auction. Default is 10. Only for tests I recommend to updated it to 3
  [GET] /blockchain/max-bid-number : retrieves the actual bid number from blockchain

- ListPrice :
  [POST] /blockchain/list-price : updates the listing price used on initializing an Auction.
  Default id 0.0001 ether
  [GET] /blockchain/list-price : retrieves actual listPrice from blockchain
