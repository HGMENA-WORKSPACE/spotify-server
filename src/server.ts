import express from 'express';
import request from 'request';
import appConfig from './appConfig';

/**
 *
 */
export default function Server(): void {
  ServerConnection.serverInstance;
}

/**
 *
 */
class ServerConnection {
  private static _instance: ServerConnection;
  private app: express.Application;
  private urlServer!: string;

  /**
   * Devuelve la instacia de this
   */
  public static get serverInstance() {
    return this._instance || (this._instance = new this());
  }

  private constructor() {
    this.app = express();
    this.init();
  }

  init() {
    const { server_port, spotify_url } = appConfig();
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      this.urlServer = req.protocol + req.get('Host') + req.originalUrl;
      res.header('Access-Control-Allow-Origin', '*');
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
      );
      next();
    });
    this.listen(Number(process.env.PORT || server_port));
    this.getToken(spotify_url);
  }

  /**
   *
   * @param port
   */
  listen(port: number) {
    this.app.listen(port, () => {
      console.log(`Servidor corriendo en puerto ${port}`);
      if (this.urlServer) this.requestToken();
    });
  }

  requestToken() {
    request(this.urlServer, (error: any, response: any, body: any) => {
      if (error) console.log(error);
      if (response) console.log(response);

      body = JSON.parse(body);
      console.log('access_token:', body.access_token); // Print the HTML for the Google homepage.
    });
  }

  /**
   *
   * @param spotify_url
   */
  getToken(spotify_url: string) {
    this.app.get('/spotify/:client_id/:client_secret', (req, resp) => {
      const { client_id, client_secret } = req.params;

      const authOptions = {
        url: spotify_url,
        headers: {
          Authorization:
            'Basic ' +
            Buffer.from(client_id + ':' + client_secret).toString('base64'),
        },
        form: {
          grant_type: 'client_credentials',
        },
        json: true,
      };
      //
      request.post(authOptions, (err, httpResponse, body) => {
        if (err) {
          return resp.status(400).json({
            ok: false,
            mensaje: 'No se pudo obtener el token',
            err,
          });
        }

        resp.json(body);
      });
    });
  }
}
