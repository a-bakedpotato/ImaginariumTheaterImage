# Imaginarium Theater Generator
Gets saved characters from [Enka.Network](https://enka.network) and generates an image based on restrictions set by the user.

## How to Use
0. Ensure [Node.JS](https://nodejs.org/en/download/package-manager) is installed.
1. Clone/download the repo and save it in a folder.
2. Run `setup.bat` to install the required packages.
3. Edit `settings.json` to set restrictions and account. Make sure the JSON is valid when saving. This can be verified using [JsonLint](https://jsonlint.com).
4. Run `run.bat`. This will open a command prompt window which shows progress on image generation. The image will automatically open after it has finished generating. The image will be automatically saved in the base folder as `output.png`.

### Credits
- [Ambr.Top](https://ambr.top/en) - Character Icons & Names
- [Axios](https://github.com/axios/axios) - HTTP requests
- [Enka.Network](https://enka.network) - API for fetching account information
- [Node Canvas](https://github.com/Automattic/node-canvas) - Image Generation