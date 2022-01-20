export type GmSolana = {
  "version": "0.1.0",
  "name": "gm_solana",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "baseAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "sayGm",
      "accounts": [
        {
          "name": "baseAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "message",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "baseAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "gmCount",
            "type": "u64"
          },
          {
            "name": "gmList",
            "type": {
              "vec": {
                "defined": "GmMessage"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "GmMessage",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "message",
            "type": "string"
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};

export const IDL: GmSolana = {
  "version": "0.1.0",
  "name": "gm_solana",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "baseAccount",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "sayGm",
      "accounts": [
        {
          "name": "baseAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "message",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "baseAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "gmCount",
            "type": "u64"
          },
          {
            "name": "gmList",
            "type": {
              "vec": {
                "defined": "GmMessage"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "GmMessage",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "message",
            "type": "string"
          },
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
