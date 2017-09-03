/**
 * Copyright (c) 2017 Kota Suizu
 * Released under the MIT license
 * http://opensource.org/licenses/mit-license.php
 **/

module.exports = function(RED) {
  "use strict";
  var request = require('request');

  var A3RTTALK_URL = 'https://api.a3rt.recruit-tech.co.jp/talk/v1/smalltalk';

  // APIKey情報を保持するConfig
  function a3rtConfig(n) {
    RED.nodes.createNode(this, n);
    this.key = n.key;
    var credentials = this.credentials;
    if ((credentials) && (credentials.hasOwnProperty("key"))) {
      this.key = credentials.key;
    }
  }
  RED.nodes.registerType("a3rt-config", a3rtConfig, {
    credentials: {
      key: {
        type: "password"
      }
    }
  });

  // A3RT-Talk NodeIO処理
  function A3RTTalk(n) {
    RED.nodes.createNode(this, n);

    this.a3rtConfig = RED.nodes.getNode(n.a3rtconfig);

    var node = this;
    this.on('input', function(msg) {
      if (_isTypeOf('String', msg.payload)) {

        var requestBody = {
          "apikey": node.a3rtConfig.key, // 必須　String
          "query": msg.payload
        };

        var options = {
          url: A3RTTALK_URL,
          headers: {
            'Content-Type': 'application/json'
          },
          // auth: {
          //     user: "",
          //     password: ""
          // },
          json: true,
          form: requestBody
        };

        request.post(options, function(err, response, body) {
          if (response.statusCode === 200) {
            msg.payload = body;
            node.send(msg);
            node.log(RED._('Succeeded to API Call.'));
          } else {
            node.error("Failed to API Call. StatusCode is " + response.statusCode + ". " + body.message);
          };
        });
      } else {
        node.error("Failed to API Call. Payload is not String.");
      }
    });
  }
  RED.nodes.registerType("A3RT-Talk", A3RTTalk);

  function _isTypeOf(type, obj) {
    var clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
  }
}
