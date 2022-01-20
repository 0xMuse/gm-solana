<script lang="ts">
  import { onMount } from "svelte";
  import * as idl from "./idl/gm_solana.json";
  import type { GmSolana } from "./types/gm_solana";
  import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
  import { Idl, Program, Provider, web3 } from "@project-serum/anchor";
  const { SystemProgram, Keypair } = web3;

  // ======== APPLICATION STATE ========

  let wallet: any;
  let account = "";

  // reactively log the wallet connection when account state changes,
  // if you don't know what this is, check out https://svelte.dev/tutorial/reactive-declarations
  $: account && console.log(`Connected to wallet: ${account}`);

  // ======== PAGE LOAD CHECKS ========

  const onLoad = async () => {
    const { solana } = window as any;
    wallet = solana;

    // set up handlers for wallet events
    wallet.on("connect", () => (account = wallet.publicKey.toString()));
    wallet.on("disconnect", () => (account = ""));

    // eagerly connect wallet if the user already has connected before, otherwise do nothing
    const resp = await wallet.connect({ onlyIfTrusted: true });
  };

  // life cycle hook for when the component is mounted
  onMount(() => {
    // run the onLoad function when the page completes loading
    window.addEventListener("load", onLoad);

    // return a cleanup function to remove the event listener to avoid memory leaks when the page unloads
    return () => window.removeEventListener("load", onLoad);
  });

  // ======== CONNECT WALLET ========
  const handleConnectWallet = async () => {
    const resp = await wallet.connect();
  };

  // ======== CONNECT TO NETWORK ========

  // get program id from IDL, the metadata is only available after a deployment
  const programID = new PublicKey(idl.metadata.address);

  // we are using local network endpoint for now
  const network = "http://127.0.0.1:8899";

  // set up connection with "preflight commitment" set to "confirmed" level, which basically means that our app
  // will treat the transaction as done only when the block is voted on by supermajority.
  // this is similar to waiting for how many confirmations like in Ethereum.
  // you can also set it to "finalized" (even more secure) or "processed" (changes might be rolled back)
  const connection = new Connection(network, "confirmed");

  // create a network and wallet context provider
  const getProvider = () => {
    const provider = new Provider(connection, wallet, {
      preflightCommitment: "confirmed",
    });
    return provider;
  };

  // helper function to get the program
  const getProgram = () => {
    const program = new Program(
      idl as Idl,
      programID,
      getProvider()
    ) as Program<GmSolana>;
    return program;
  };

  // ======== INITIATE BASE ACCOUNT ========

  // the base account that will hold the gm messages,
  // if we want to share the same "gm Solana" instance then we need to provide the same base account
  let baseAccountPublicKey: PublicKey;
  let baseAccountPublicKeyInput = ""; // UI state used for the input field

  // because state in Solana is not tied with programs, users can create their own "baseAccount" for the gm app,
  // the way to share and establish our baseAccount as the "official" one is to provide users with ours up front
  // in the app client. otherwise we can also hardcode a "deployer account" in the program so only it can do it.
  // the initializeAccount() here is a naive implementation that creates a new baseAccount on demand.
  const initializeAccount = async () => {
    const provider = getProvider();
    const program = getProgram();
    const _baseAccount = Keypair.generate();
    Keypair;

    await program.rpc.initialize({
      accounts: {
        baseAccount: _baseAccount.publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [_baseAccount],
    });
    baseAccountPublicKey = _baseAccount.publicKey;
    console.log("New BaseAccount:", baseAccountPublicKey.toString());
    await getGmList();
  };

  // alternative to initializeAccount(), loadAccount() allows you to pick up a previously created baseAccount
  // so we can share the same "gm Solana" instance!
  const loadAccount = async () => {
    baseAccountPublicKey = new PublicKey(baseAccountPublicKeyInput);
    console.log("Loaded BaseAccount:", baseAccountPublicKey.toString());
    await getGmList();
  };

  // ======== APPLICATION STATE ========
  // ... other state
  let gmList = [];
  let gmMessage = "";

  // ======== PROGRAM INTERACTION ========

  // interacts with our program and updates local the gm list
  const getGmList = async () => {
    const program = getProgram();
    const account = await program.account.baseAccount.fetch(
      baseAccountPublicKey
    );

    console.log("Got the account", account);
    gmList = account.gmList as any[];
  };

  // interacts with our program and submits a new gm message
  const sayGm = async () => {
    const provider = getProvider();
    const program = getProgram();

    await program.rpc.sayGm(gmMessage, {
      accounts: {
        baseAccount: baseAccountPublicKey,
        user: provider.wallet.publicKey,
      },
      // if we don't supply a signer, it will try to use the connected wallet by default
    });
    console.log("gm successfully sent", gmMessage);
    gmMessage = ""; // clears the input field

    await getGmList(); // updates the local gm list
  };

  $: console.log("gmList:", gmList); // just some extra logging when the gm list changes
</script>

<main>
  <h1>gm, Solana!</h1>

  <!-- Conditionally render the user account, connect button, or just a warning -->
  {#if account}
    <h3>Your wallet:</h3>
    <p>{account}</p>
  {:else if wallet}
    {#if wallet.isPhantom}
      <h2>Phantom Wallet found!</h2>
      <button on:click={handleConnectWallet}>Connect wallet</button>
    {:else}
      <h2>Solana wallet found but not supported.</h2>
    {/if}
  {:else}
    <h2>Solana wallet not found.</h2>
  {/if}

  {#if account}
    {#if !baseAccountPublicKey}
      <button on:click={initializeAccount}>Initialize account</button>
      or
      <input
        type="text"
        placeholder="use existing account..."
        bind:value={baseAccountPublicKeyInput}
      />
      <button on:click={loadAccount}>Load</button>
    {:else}
      Using gm solana base account: {baseAccountPublicKey.toString()}
    {/if}
  {/if}

  {#if baseAccountPublicKey}
    <div>
      <h3>gm List:</h3>
      <ul>
        {#each gmList as gm}
          <li>
            <b>{gm.message}</b>, said {gm.user.toString().slice(0, 6)}... at {new Date(
              gm.timestamp.toNumber() * 1000
            ).toLocaleTimeString()}
          </li>
        {/each}
      </ul>
      <button on:click={getGmList}>Refresh gms!</button>
    </div>

    <div>
      <h3>Say gm:</h3>
      <input
        type="text"
        placeholder="write something..."
        bind:value={gmMessage}
      />
      <button on:click={sayGm} disabled={!gmMessage}>Say gm!</button>
    </div>
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
