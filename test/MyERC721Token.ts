import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

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
      const hashedMessage = ethers.hashMessage(message);
      const signature = await this.user.signMessage(message);

      await this.token.connect(this.user).signedMint(numberOfTokens, hashedMessage, signature);

      expect(await this.token.balanceOf(this.user.address)).to.equal(numberOfTokens);
    });

    it("Should fail with an invalid signature", async function () {
      const numberOfTokens = 1;
      const message = '1';
      const fakeSignature = await this.user.signMessage("2");
      const hashedMessage = ethers.hashMessage(message);

      await expect(this.token.connect(this.user).signedMint(numberOfTokens, hashedMessage, fakeSignature))
        .to.be.revertedWith("Invalid signature.");
    });

    it("Should prevent reusing a signature", async function () {
      const message = '1';
      const numberOfTokens = 1n;
      const hashedMessage = ethers.hashMessage(message);
      const signature = await this.user.signMessage(message);
      

      await this.token.connect(this.user).signedMint(numberOfTokens, hashedMessage, signature);

      await expect(this.token.connect(this.user).signedMint(numberOfTokens, hashedMessage, signature))
        .to.be.revertedWith("Signature already used.");
    });
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