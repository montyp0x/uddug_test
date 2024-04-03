import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, toUtf8Bytes } from "ethers";
import { MyERC721Token } from "../typechain-types";
import hre from "hardhat";

const TEST_MESSAGE = ethers.id('OpenZeppelin');

async function deployFixture() {
  const [owner, user] = await ethers.getSigners();
  const MyERC721TokenFactory = await ethers.getContractFactory("MyERC721Token");

  const token = await MyERC721TokenFactory.deploy();

  return { token, owner, user };
}

describe("MyERC721Token", function () {

  beforeEach(async function () {
    Object.assign(this, await loadFixture(deployFixture));
  })
  


  describe("signedMint", function () {
    it("Should mint with a valid signature", async function () {

      const message = '1';
      const numberOfTokens = 1n;
      const signature = await this.user.signMessage(message);

      console.log("user", this.user.address);
      console.log("owner", this.owner.address);
      console.log("ts", signature);

      // const [a, b, c] = await token.connect(user).test(numberOfTokens, signature);

      // console.log("mh", a);
      // console.log("smh", b);
      // console.log("acc", c);

      console.log("ethers.hashMessage", ethers.hashMessage(message));

      await this.token.connect(this.user).signedMint(numberOfTokens, signature);

      expect(await this.token.balanceOf(this.user.address)).to.equal(numberOfTokens);
    });

    // it("Should fail with an invalid signature", async function () {
    //   const { token, owner, user } = await loadFixture(deployFixture);
    //   const numberOfTokens = 1;
    //   const fakeSignature = "0x" + "00".repeat(65); 

    //   await expect(token.connect(addr1).signedMint(numberOfTokens, fakeSignature))
    //     .to.be.revertedWith("Invalid signature.");
    // });

    // it("Should prevent reusing a signature", async function () {
    //   const numberOfTokens = 1;
    //   const addr1Address = await addr1.getAddress();
    //   const message = ethers.utils.solidityKeccak256(["address", "uint256"], [addr1Address, numberOfTokens]);
    //   const signature = await owner.signMessage(ethers.utils.arrayify(message));


    //   await myERC721Token.connect(addr1).signedMint(numberOfTokens, signature);

    //   await expect(myERC721Token.connect(addr1).signedMint(numberOfTokens, signature))
    //     .to.be.revertedWith("Signature already used.");
    // });
  });

  describe("mintSet", function () {
    it("Should mint 6 nfts", async function () {
      const SET_PRICE = ethers.parseEther("0.05");

      await this.token.connect(this.user).mintSet({value: SET_PRICE});

      expect(await this.token.balanceOf(this.user.address)).to.equal(6n);
    });

    it("Should throw an error (two set mints are banned)", async function () {
      const SET_PRICE = ethers.parseEther("0.05");

      await this.token.connect(this.user).mintSet({value: SET_PRICE});

      expect(await this.token.balanceOf(this.user.address)).to.equal(6n);

      const error = this.token.connect(this.user).mintSet({value: SET_PRICE});

      await expect(error).to.be.revertedWith('Address has already minted a set.');
    });
  });

  describe("mint", function () {
    it("Should mint n nfts", async function () {
      const n = 3n;

      const MINT_PRICE = ethers.parseEther(`0.0${n}`);

      await this.token.connect(this.user).mint(n, {value: MINT_PRICE});

      expect(await this.token.balanceOf(this.user.address)).to.equal(n);
    });

    it("Should throw a tx limit error", async function () {
      const n = 5n;

      const MINT_PRICE = ethers.parseEther(`0.0${n}`);

      const error = this.token.connect(this.user).mint(n, {value: MINT_PRICE});

      await expect(error).to.be.revertedWith('Cannot mint that many at once.');
    });

    it("Should throw a total supply limit error", async function () {
      const n = 3n;
      let currentSupply = 0n;
      const MINT_PRICE = ethers.parseEther(`0.0${n}`);

      while (currentSupply + n < 1000) {
        await this.token.connect(this.user).mint(n, {value: MINT_PRICE});
        currentSupply += n;
      }

      const error = this.token.connect(this.user).mint(n, {value: MINT_PRICE});

      await expect(error).to.be.revertedWith('Exceeds maximum supply.');
    });
  });
});