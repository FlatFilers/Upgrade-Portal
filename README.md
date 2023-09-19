# Upgrade Playground

This repository was created to show you how your Portal 2.0 implementation would look as a Platform implementation. You are able to run both the Start-Portal-2 and Finish-Platform folders individually to see just how this would work. You can check out the [Upgrade Guide](https://flatfile.com/docs/guides/upgrade/v2_upgrade) to get more info about how this update works.

## Running the solutions
### Start-Portal-2

Navigate into the `Start-Portal-2` directory. Install node modules.
```bash
npm install
```
Replace "YOUR_LICENSE_KEY" with your Portal license key in `src/index.js`. Now you are ready to run the local web server. 
```bash
npm run start
```
This command will start a local web server for you and run your application on port 1234. 

*_Note_* In order for the Flatfile importer to work properly, you will have to utilize a web server to run it, otherwise the Flatfile importer will never load and the button will seemingly not work. Following the previous steps and using the start command will start this server for you. 

### Start Finish-Platform

In order to utilize Platform, you will have to have a Platform account. There is a new dashboard and login for Plaftorm. If you haven't signed up, please visit [platform.flatfile.com](https://platform.flatfile.com) to sign up for your free account. 

Go to the `Finish-Platform` directory. Install node modules.
```
npm install
```
Replace "YOUR_PUBLISHABLE_KEY" and "YOUR_ENV_ID" inside of `public/index.html` with your Publishable key and Environment ID for Platform. You can get those two things from the "Developer Settings" tab inside [your account](https://platform.flatfile.com). 

Next, you will need to setup your environment variables. You can copy .env.exmple with `cp .env.example .env`. In the same "Developer Settings" tab, you will grab your Private Key and Environment ID and put them into the .env file. 

Before you are ready to run the server, you will need to deploy your listener. Run command `npx flatfile@latest deploy listeners/listener.js` to deploy the listener code from `listeners/listener.js`. 

Now you are ready to run your server with `npm run start`.
