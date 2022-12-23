import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { abi } from './Auction.json';
import formatStruct from './utils/format.struct';

@Injectable()
export class BlockchainService {
  protected logger = new Logger(this.constructor.name);

  constructor(private readonly configService: ConfigService) {}

  contractAddress = this.configService.get<string>('AUCTION_CONTRACT');
  adminWallet = this.configService.get<string>('ADMIN_WALLET');
  providerApi = this.configService.get<string>('PROVIDER_API');
  providerNetwork = this.configService.get<string>('PROVIDER_NETWORK');
  listTokenPrice = this.configService.get<string>('LIST_TOKEN_PRICE');
  gasLimit = this.configService.get<string>('GAS_LIMIT');
  gasPrice = this.configService.get<string>('GAS_PRICE');

  contractABI = abi;
  provider = new ethers.providers.AlchemyProvider(
    this.providerNetwork,
    this.providerApi,
  );

  /**
   * @description mounts the signer object related to admin wallet of contract and auctions
   */
  private getAdminCredentials(): ethers.Wallet {
    const wallet = new ethers.Wallet(this.adminWallet);
    const signer = wallet.connect(this.provider);
    return signer;
  }

  /**
   * @description mounts the signer object related to admin wallet of contract and auctions
   */
  private getAuctionContractInstance(): ethers.Contract {
    const signer = this.getAdminCredentials();
    return new ethers.Contract(this.contractAddress, this.contractABI, signer);
  }

  /**
   * @description gets gas object with default data
   */
  private getGas(): object {
    return { gasLimit: this.gasLimit, gasPrice: this.gasPrice };
  }

  /**
   * @description calls the Auction contract to create productAuction Struct and to mint a NFT
   * @requires name
   * @requires seller ethereum valid address
   * @requires owner only administrator wallet may request
   */
  async createAuctionProductBlockchain(
    name: string,
    seller: string,
  ): Promise<number> {
    const auctionContract = this.getAuctionContractInstance();

    let tokenId = await auctionContract.getCurrentTokenId();
    tokenId++;

    this.logger.log('creating product on blockchain for tokenId: ', tokenId);
    await auctionContract.createProductToken(name, seller, this.getGas());

    return tokenId;
  }

  /**
   * @description update Auction contract and set this product auction as listed
   * @requires tokenId auction not initialized before
   * @requires tokenId created requesting createProductToken
   * @requires initialPrice must be > 0
   * @requires owner administration wallet
   */
  async initializeAuction(tokenId: number, initialPrice: string): Promise<any> {
    const auctionContract = this.getAuctionContractInstance();
    const updatedListingPrice = await auctionContract.getListPrice();

    this.logger.log('initializing auction for tokenId: ', tokenId);
    const auction = await auctionContract.initializeAuction(
      tokenId,
      ethers.utils.parseEther(initialPrice),
      {
        value: updatedListingPrice,
      },
    );
    return auction;
  }

  /**
   * @description update AuctionProduct struct and update bidder with it's bestPrice
   * @requires tokenId auction initialized
   * @requires bidPrice higher than last bid
   * @requires owner administration wallet
   */
  async bid(
    tokenId: number,
    bidPrice: string,
    bidderAddress: string,
  ): Promise<any> {
    const auctionContract = this.getAuctionContractInstance();
    this.logger.log('transacting a bid for tokenId: ', tokenId);
    const tx = await auctionContract.bid(
      tokenId,
      //ethers.utils.parseUnits(bidPrice, 'ether'),
      ethers.utils.parseEther(bidPrice),
      bidderAddress,
      this.getGas(),
    );
    //await tx.wait();
  }

  /**
   *
   * @param tokenId valid tokenId
   * @returns Auction[]
   */
  async getAuctionOnChain(tokenId: number): Promise<any> {
    const auctionContract = this.getAuctionContractInstance();
    this.logger.log(
      'Requesting Auction data from blockchain for tokenId: ',
      tokenId,
    );
    const auction = await auctionContract.getAuction(tokenId);
    this.logger.log('Auction retrieved for tokenId: ', tokenId);
    return formatStruct(auction);
  }
}
