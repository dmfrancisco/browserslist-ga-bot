<img width="520" height="68" src="./public/logo.svg" alt="Browserslist-GA logo">

Target browsers tailored to your audience using Google Analytics and GitHub Apps.

---

### Found a bug or have feedback?

Please open an issue in our [GitHub page](https://github.com/dmfrancisco/browserslist-ga-bot).
Pull requests are always welcomed too. Thank you in advance 🙌

### Setting up the server

Install the [`foreman`](https://github.com/ddollar/foreman) gem.
Running `foreman start` will start the database for you and the rails server.
You can run processes individually using `foreman start web` and `foreman start postgresql`.

Credentials and other sensitive information are stored in the `.env` file.
Duplicate the existing `.env.example` file and fill the variables.
To load these variables when you run rails commands, prefix them with `foreman run`.
For example, to start the rails console type the following command:

```shell
foreman run rails c
```
