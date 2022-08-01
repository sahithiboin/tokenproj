import React, { Component } from "react";
import MyToken from "./contracts/MyToken.json";
import MyTokenSale from "./contracts/MyTokenSale.json"
import kycContract from "./contracts/KycContract.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
    state = { loaded: false, kycAddress: "0x123", tokenSaleAddress: "", userTokens: 0};
    componentDidMount = async () => {
        try {
            this.web3 = await getWeb3();
            this.accounts = await this.web3.eth.getAccounts();
            this.networkId = await this.web3.eth.getChainId();
            
            this.MyToken = new this.web3.eth.Contract(
                MyToken.abi,
                MyToken.networks[this.networkId] && MyToken.networks[this.networkId].address,
            );
            this.MyTokenSale = new this.web3.eth.Contract(
                MyTokenSale.abi,
                MyTokenSale.networks[this.networkId] && MyTokenSale.networks[this.networkId],address,
            );
            this.kycContract = new this.web3.eth.Contract(
                kycContract.abi,
                kycContract.networks[this.networkId] && kycContract.networks[this.networkId].address,
            );
            this.listenToTokenTransfer();
            this.setState({ loaded:true, tokenSaleAddress: this.MyTokenSale._address }, this.updateUserTokens);
        } catch (error){
            alert(
                `Failed to load web3, accounts or contract. Check console for details.`,
                );
                console.error(error);
        }
    };

    render() {
        if (!this.state.loaded) {
            return <div>Loading Web3, accounts and contract...</div>        
        }
        return (
            <div className="App">
                <h1>Cappuccino Token for StarDucks</h1>
                <h2>Enable your account</h2>
                Address to allow: <input type="text" name="kycAddress" value={this.state.kycAddress} onChange = {this.handleInputChange} />
                <button type="button" onClick={this.handleKycSubmit}>Add Address to Whitelist</button>
                <h2>Buy Cappuccino-Tokens</h2>
                <p>Send Ether to this address: {this.state.tokenSaleAddress}</p>
                <p>You have: {this.state.userTokens}</p>
                <button type="button" onClick={this.handleBuyToken}>But more tokens</button>            
            </div>
        );
    }
    handleBuyToken = async () => {
        await this.MyTokenSale.methods.buyTokens(this.accounts[0]).send({from: this.accounts[0], value: 1})
    }
    handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === "checkbox" ? target.checked : target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    handleKycSubmit = async () => {
        const {kycAddress} = this.state;
        await this.kycContract.methods.setKycCompleted(kycAddress).send({from: this.accounts[0]});
        alert("Account "+kycAddress+" is now whitelisted");
    }
    updateUserTokens = async() => {
        let userTokens = await this.MyToken.methods.balanceOf(this.accounts[0]).call();
        this.setState({userTokens: userTokens});
    }
    listenToTokenTransfer = async() => {
        this.MyToken.events.Transfer({to: this.accounts[0]}).on("data", this.updateUserTokens);
    }
}
export default App;