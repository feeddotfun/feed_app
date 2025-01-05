/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/meme_fund.json`.
 */
export type MemeFund = {
    "address": "AsBScVvhTKxqFfe6oM1bxkWdaJE1TTGoJZhL2fGUGKWV",
    "metadata": {
      "name": "memeFund",
      "version": "0.1.0",
      "spec": "0.1.0",
      "description": "Created with Anchor"
    },
    "instructions": [
      {
        "name": "adminClaimRewards",
        "discriminator": [
          228,
          5,
          104,
          85,
          191,
          26,
          71,
          253
        ],
        "accounts": [
          {
            "name": "registry",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    114,
                    101,
                    103,
                    105,
                    115,
                    116,
                    114,
                    121
                  ]
                },
                {
                  "kind": "arg",
                  "path": "memeId"
                }
              ]
            }
          },
          {
            "name": "state",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    116,
                    101
                  ]
                }
              ]
            }
          },
          {
            "name": "vault",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116
                  ]
                },
                {
                  "kind": "arg",
                  "path": "memeId"
                }
              ]
            }
          },
          {
            "name": "feeRecipient",
            "writable": true
          },
          {
            "name": "authority",
            "signer": true,
            "relations": [
              "state"
            ]
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "memeId",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          }
        ]
      },
      {
        "name": "claimTokens",
        "discriminator": [
          108,
          216,
          210,
          231,
          0,
          212,
          42,
          64
        ],
        "accounts": [
          {
            "name": "registry",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    114,
                    101,
                    103,
                    105,
                    115,
                    116,
                    114,
                    121
                  ]
                },
                {
                  "kind": "arg",
                  "path": "memeId"
                }
              ]
            }
          },
          {
            "name": "contribution",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    99,
                    111,
                    110,
                    116,
                    114,
                    105,
                    98,
                    117,
                    116,
                    105,
                    111,
                    110
                  ]
                },
                {
                  "kind": "arg",
                  "path": "memeId"
                },
                {
                  "kind": "account",
                  "path": "contributor"
                }
              ]
            }
          },
          {
            "name": "contributor",
            "writable": true,
            "signer": true,
            "relations": [
              "contribution"
            ]
          },
          {
            "name": "vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116
                  ]
                },
                {
                  "kind": "arg",
                  "path": "memeId"
                }
              ]
            }
          },
          {
            "name": "vaultTokenAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "vault"
                },
                {
                  "kind": "const",
                  "value": [
                    6,
                    221,
                    246,
                    225,
                    215,
                    101,
                    161,
                    147,
                    217,
                    203,
                    225,
                    70,
                    206,
                    235,
                    121,
                    172,
                    28,
                    180,
                    133,
                    237,
                    95,
                    91,
                    55,
                    145,
                    58,
                    140,
                    245,
                    133,
                    126,
                    255,
                    0,
                    169
                  ]
                },
                {
                  "kind": "account",
                  "path": "mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "userTokenAccount",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "account",
                  "path": "contributor"
                },
                {
                  "kind": "const",
                  "value": [
                    6,
                    221,
                    246,
                    225,
                    215,
                    101,
                    161,
                    147,
                    217,
                    203,
                    225,
                    70,
                    206,
                    235,
                    121,
                    172,
                    28,
                    180,
                    133,
                    237,
                    95,
                    91,
                    55,
                    145,
                    58,
                    140,
                    245,
                    133,
                    126,
                    255,
                    0,
                    169
                  ]
                },
                {
                  "kind": "account",
                  "path": "mint"
                }
              ],
              "program": {
                "kind": "const",
                "value": [
                  140,
                  151,
                  37,
                  143,
                  78,
                  36,
                  137,
                  241,
                  187,
                  61,
                  16,
                  41,
                  20,
                  142,
                  13,
                  131,
                  11,
                  90,
                  19,
                  153,
                  218,
                  255,
                  16,
                  132,
                  4,
                  142,
                  123,
                  216,
                  219,
                  233,
                  248,
                  89
                ]
              }
            }
          },
          {
            "name": "mint"
          },
          {
            "name": "state",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    116,
                    101
                  ]
                }
              ]
            }
          },
          {
            "name": "tokenProgram",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "associatedTokenProgram",
            "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "memeId",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          }
        ]
      },
      {
        "name": "contribute",
        "discriminator": [
          82,
          33,
          68,
          131,
          32,
          0,
          205,
          95
        ],
        "accounts": [
          {
            "name": "vault",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116
                  ]
                },
                {
                  "kind": "arg",
                  "path": "memeId"
                }
              ]
            }
          },
          {
            "name": "registry",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    114,
                    101,
                    103,
                    105,
                    115,
                    116,
                    114,
                    121
                  ]
                },
                {
                  "kind": "arg",
                  "path": "memeId"
                }
              ]
            }
          },
          {
            "name": "contribution",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    99,
                    111,
                    110,
                    116,
                    114,
                    105,
                    98,
                    117,
                    116,
                    105,
                    111,
                    110
                  ]
                },
                {
                  "kind": "arg",
                  "path": "memeId"
                },
                {
                  "kind": "account",
                  "path": "contributor"
                }
              ]
            }
          },
          {
            "name": "contributor",
            "writable": true,
            "signer": true
          },
          {
            "name": "state",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    116,
                    101
                  ]
                }
              ]
            }
          },
          {
            "name": "feeRecipient",
            "writable": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "memeId",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      },
      {
        "name": "createMemeRegistry",
        "discriminator": [
          185,
          241,
          171,
          168,
          108,
          84,
          46,
          60
        ],
        "accounts": [
          {
            "name": "registry",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    114,
                    101,
                    103,
                    105,
                    115,
                    116,
                    114,
                    121
                  ]
                },
                {
                  "kind": "arg",
                  "path": "memeId"
                }
              ]
            }
          },
          {
            "name": "vault",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116
                  ]
                },
                {
                  "kind": "arg",
                  "path": "memeId"
                }
              ]
            }
          },
          {
            "name": "state",
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    116,
                    101
                  ]
                }
              ]
            }
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true,
            "relations": [
              "state"
            ]
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "memeId",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          }
        ]
      },
      {
        "name": "initialize",
        "discriminator": [
          175,
          175,
          109,
          31,
          13,
          152,
          155,
          237
        ],
        "accounts": [
          {
            "name": "state",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    116,
                    101
                  ]
                }
              ]
            }
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          }
        ],
        "args": [
          {
            "name": "feeRecipient",
            "type": "pubkey"
          },
          {
            "name": "initialMinBuyAmount",
            "type": "u64"
          },
          {
            "name": "initialMaxBuyAmount",
            "type": "u64"
          },
          {
            "name": "initialFundDuration",
            "type": "i64"
          },
          {
            "name": "initialMaxFundLimit",
            "type": "u64"
          },
          {
            "name": "initialCommissionRate",
            "type": "u8"
          },
          {
            "name": "initialTokenClaimAvailableTime",
            "type": "i64"
          }
        ]
      },
      {
        "name": "startMeme",
        "discriminator": [
          84,
          25,
          29,
          95,
          8,
          105,
          128,
          95
        ],
        "accounts": [
          {
            "name": "registry",
            "writable": true
          },
          {
            "name": "vault",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    118,
                    97,
                    117,
                    108,
                    116
                  ]
                },
                {
                  "kind": "account",
                  "path": "registry.meme_id",
                  "account": "memeRegistry"
                }
              ]
            }
          },
          {
            "name": "mint",
            "writable": true,
            "signer": true
          },
          {
            "name": "mintAuthority",
            "writable": true
          },
          {
            "name": "bondingCurve",
            "writable": true
          },
          {
            "name": "associatedBondingCurve",
            "writable": true
          },
          {
            "name": "global"
          },
          {
            "name": "mplTokenMetadata"
          },
          {
            "name": "metadata",
            "writable": true
          },
          {
            "name": "authority",
            "writable": true,
            "signer": true
          },
          {
            "name": "systemProgram",
            "address": "11111111111111111111111111111111"
          },
          {
            "name": "tokenProgram",
            "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          },
          {
            "name": "associatedTokenProgram"
          },
          {
            "name": "rent",
            "address": "SysvarRent111111111111111111111111111111111"
          },
          {
            "name": "eventAuthority"
          },
          {
            "name": "pumpProgram"
          },
          {
            "name": "feeRecipient",
            "writable": true
          },
          {
            "name": "associatedUser",
            "writable": true
          }
        ],
        "args": [
          {
            "name": "memeId",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "buyAmount",
            "type": "u64"
          },
          {
            "name": "maxSolCost",
            "type": "u64"
          }
        ]
      },
      {
        "name": "updateCommissionRate",
        "discriminator": [
          236,
          246,
          147,
          40,
          231,
          17,
          77,
          173
        ],
        "accounts": [
          {
            "name": "state",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    116,
                    101
                  ]
                }
              ]
            }
          },
          {
            "name": "authority",
            "signer": true,
            "relations": [
              "state"
            ]
          }
        ],
        "args": [
          {
            "name": "newRate",
            "type": "u8"
          }
        ]
      },
      {
        "name": "updateFeeRecipient",
        "discriminator": [
          249,
          0,
          198,
          35,
          183,
          123,
          57,
          188
        ],
        "accounts": [
          {
            "name": "state",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    116,
                    101
                  ]
                }
              ]
            }
          },
          {
            "name": "authority",
            "signer": true,
            "relations": [
              "state"
            ]
          }
        ],
        "args": [
          {
            "name": "newFeeRecipient",
            "type": "pubkey"
          }
        ]
      },
      {
        "name": "updateFundDuration",
        "discriminator": [
          105,
          187,
          244,
          29,
          245,
          138,
          116,
          13
        ],
        "accounts": [
          {
            "name": "state",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    116,
                    101
                  ]
                }
              ]
            }
          },
          {
            "name": "authority",
            "signer": true,
            "relations": [
              "state"
            ]
          }
        ],
        "args": [
          {
            "name": "newFundDuration",
            "type": "i64"
          }
        ]
      },
      {
        "name": "updateMaxBuyAmount",
        "discriminator": [
          63,
          211,
          236,
          169,
          5,
          81,
          223,
          216
        ],
        "accounts": [
          {
            "name": "state",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    116,
                    101
                  ]
                }
              ]
            }
          },
          {
            "name": "authority",
            "signer": true,
            "relations": [
              "state"
            ]
          }
        ],
        "args": [
          {
            "name": "newMaxBuyAmount",
            "type": "u64"
          }
        ]
      },
      {
        "name": "updateMaxClaimAvailableTime",
        "discriminator": [
          59,
          91,
          32,
          253,
          97,
          211,
          139,
          64
        ],
        "accounts": [
          {
            "name": "state",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    116,
                    101
                  ]
                }
              ]
            }
          },
          {
            "name": "authority",
            "signer": true,
            "relations": [
              "state"
            ]
          }
        ],
        "args": [
          {
            "name": "newClaimAvailableTime",
            "type": "i64"
          }
        ]
      },
      {
        "name": "updateMaxFundLimit",
        "discriminator": [
          119,
          45,
          250,
          146,
          87,
          90,
          104,
          61
        ],
        "accounts": [
          {
            "name": "state",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    116,
                    101
                  ]
                }
              ]
            }
          },
          {
            "name": "authority",
            "signer": true,
            "relations": [
              "state"
            ]
          }
        ],
        "args": [
          {
            "name": "newMaxFundLimit",
            "type": "u64"
          }
        ]
      },
      {
        "name": "updateMinBuyAmount",
        "discriminator": [
          69,
          199,
          123,
          153,
          108,
          225,
          210,
          46
        ],
        "accounts": [
          {
            "name": "state",
            "writable": true,
            "pda": {
              "seeds": [
                {
                  "kind": "const",
                  "value": [
                    115,
                    116,
                    97,
                    116,
                    101
                  ]
                }
              ]
            }
          },
          {
            "name": "authority",
            "signer": true,
            "relations": [
              "state"
            ]
          }
        ],
        "args": [
          {
            "name": "newMinBuyAmount",
            "type": "u64"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "contribution",
        "discriminator": [
          182,
          187,
          14,
          111,
          72,
          167,
          242,
          212
        ]
      },
      {
        "name": "memeRegistry",
        "discriminator": [
          105,
          119,
          68,
          180,
          221,
          182,
          24,
          249
        ]
      },
      {
        "name": "state",
        "discriminator": [
          216,
          146,
          107,
          94,
          104,
          75,
          182,
          177
        ]
      }
    ],
    "events": [
      {
        "name": "commissionRateUpdated",
        "discriminator": [
          49,
          221,
          197,
          86,
          50,
          237,
          1,
          177
        ]
      },
      {
        "name": "contributionMade",
        "discriminator": [
          81,
          218,
          72,
          109,
          93,
          96,
          131,
          199
        ]
      },
      {
        "name": "feeRecipientUpdated",
        "discriminator": [
          24,
          150,
          233,
          92,
          169,
          221,
          233,
          244
        ]
      },
      {
        "name": "fundDurationUpdated",
        "discriminator": [
          17,
          98,
          43,
          21,
          30,
          64,
          60,
          87
        ]
      },
      {
        "name": "maxBuyAmountUpdated",
        "discriminator": [
          108,
          35,
          104,
          141,
          207,
          47,
          59,
          146
        ]
      },
      {
        "name": "maxFundLimitUpdated",
        "discriminator": [
          62,
          193,
          191,
          152,
          41,
          24,
          207,
          96
        ]
      },
      {
        "name": "memeRegistryCreated",
        "discriminator": [
          159,
          48,
          194,
          210,
          237,
          118,
          9,
          215
        ]
      },
      {
        "name": "memeStarted",
        "discriminator": [
          39,
          126,
          154,
          44,
          89,
          18,
          228,
          158
        ]
      },
      {
        "name": "minBuyAmountUpdated",
        "discriminator": [
          198,
          4,
          96,
          237,
          9,
          131,
          120,
          180
        ]
      },
      {
        "name": "tokensClaimed",
        "discriminator": [
          25,
          128,
          244,
          55,
          241,
          136,
          200,
          91
        ]
      }
    ],
    "errors": [
      {
        "code": 6000,
        "name": "exceedsMaxAmount",
        "msg": "Contribution exceeds maximum allowed amount"
      },
      {
        "code": 6001,
        "name": "contributorAlreadyExists",
        "msg": "This contributor has already participated"
      },
      {
        "code": 6002,
        "name": "fundClosed",
        "msg": "Fund is closed for contributions"
      },
      {
        "code": 6003,
        "name": "invalidMemeId",
        "msg": "Invalid Meme ID"
      },
      {
        "code": 6004,
        "name": "arithmeticOverflow",
        "msg": "Arithmetic overflow"
      },
      {
        "code": 6005,
        "name": "unauthorized",
        "msg": "unauthorized"
      },
      {
        "code": 6006,
        "name": "fundExpired",
        "msg": "Fund has expired"
      },
      {
        "code": 6007,
        "name": "fundStillActive",
        "msg": "Fund is still active"
      },
      {
        "code": 6008,
        "name": "exceedsMaxAllowedAmount",
        "msg": "Exceeds maximum allowed amount of 2 SOL"
      },
      {
        "code": 6009,
        "name": "commissionRateTooHigh",
        "msg": "Commission rate cannot exceed 10%"
      },
      {
        "code": 6010,
        "name": "invalidFundDuration",
        "msg": "Invalid fund duration"
      },
      {
        "code": 6011,
        "name": "insufficientBalance",
        "msg": "Insufficient balance"
      },
      {
        "code": 6012,
        "name": "sameWalletAddress",
        "msg": "New wallet address is the same as the old one"
      },
      {
        "code": 6013,
        "name": "maxContributorsReached",
        "msg": "Maximum number of contributors reached"
      },
      {
        "code": 6014,
        "name": "exceedsMaxFundLimit",
        "msg": "Exceeds maximum fund limit"
      },
      {
        "code": 6015,
        "name": "belowMinAmount",
        "msg": "Contribution is below the minimum allowed amount"
      },
      {
        "code": 6016,
        "name": "belowMinAllowedAmount",
        "msg": "New minimum buy amount is below the allowed minimum of 0.1 SOL"
      },
      {
        "code": 6017,
        "name": "exceedsMaxBuyAmount",
        "msg": "New minimum buy amount exceeds the current maximum buy amount"
      },
      {
        "code": 6018,
        "name": "invalidBuyAmount",
        "msg": "Invalid buy amount: minimum exceeds maximum"
      },
      {
        "code": 6019,
        "name": "symbolTooLong",
        "msg": "Symbol must be 10 characters or less"
      },
      {
        "code": 6020,
        "name": "nameTooLong",
        "msg": "Name must be 32 characters or less"
      },
      {
        "code": 6021,
        "name": "invalidFeeRecipient",
        "msg": "Invalid fee recipient address"
      },
      {
        "code": 6022,
        "name": "ataCreationFailed",
        "msg": "Failed to create Associated Token Account"
      },
      {
        "code": 6023,
        "name": "alreadyClaimed",
        "msg": "Tokens have already been claimed"
      },
      {
        "code": 6024,
        "name": "zeroClaimAmount",
        "msg": "Zero claim amount"
      },
      {
        "code": 6025,
        "name": "insufficientVaultBalance",
        "msg": "Insufficient vault balance"
      },
      {
        "code": 6026,
        "name": "zeroContributionAmount",
        "msg": "Zero contribution amount"
      },
      {
        "code": 6027,
        "name": "noFundsInRegistry",
        "msg": "No funds in registry"
      },
      {
        "code": 6028,
        "name": "notAllTokensClaimed",
        "msg": "Not all tokens have been claimed yet"
      },
      {
        "code": 6029,
        "name": "noRewardsToClaim",
        "msg": "No rewards to claim"
      },
      {
        "code": 6030,
        "name": "claimTimeNotReached",
        "msg": "Token claim time has not been reached yet"
      }
    ],
    "types": [
      {
        "name": "commissionRateUpdated",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "oldRate",
              "type": "u8"
            },
            {
              "name": "newRate",
              "type": "u8"
            }
          ]
        }
      },
      {
        "name": "contribution",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "memeId",
              "type": {
                "array": [
                  "u8",
                  16
                ]
              }
            },
            {
              "name": "contributor",
              "type": "pubkey"
            },
            {
              "name": "amount",
              "type": "u64"
            },
            {
              "name": "timestamp",
              "type": "i64"
            },
            {
              "name": "isClaimed",
              "type": "bool"
            }
          ]
        }
      },
      {
        "name": "contributionMade",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "memeId",
              "type": {
                "array": [
                  "u8",
                  16
                ]
              }
            },
            {
              "name": "contributor",
              "type": "pubkey"
            },
            {
              "name": "amount",
              "type": "u64"
            },
            {
              "name": "commissionAmount",
              "type": "u64"
            },
            {
              "name": "netContributionAmount",
              "type": "u64"
            },
            {
              "name": "timestamp",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "feeRecipientUpdated",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "oldWallet",
              "type": "pubkey"
            },
            {
              "name": "newWallet",
              "type": "pubkey"
            }
          ]
        }
      },
      {
        "name": "fundDurationUpdated",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "oldDuration",
              "type": "i64"
            },
            {
              "name": "newDuration",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "maxBuyAmountUpdated",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "oldAmount",
              "type": "u64"
            },
            {
              "name": "newAmount",
              "type": "u64"
            }
          ]
        }
      },
      {
        "name": "maxFundLimitUpdated",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "oldLimit",
              "type": "u64"
            },
            {
              "name": "newLimit",
              "type": "u64"
            }
          ]
        }
      },
      {
        "name": "memeRegistry",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "memeId",
              "type": {
                "array": [
                  "u8",
                  16
                ]
              }
            },
            {
              "name": "totalFunds",
              "type": "u64"
            },
            {
              "name": "startTime",
              "type": "i64"
            },
            {
              "name": "endTime",
              "type": "i64"
            },
            {
              "name": "authority",
              "type": "pubkey"
            },
            {
              "name": "contributorCount",
              "type": "u64"
            },
            {
              "name": "mint",
              "type": "pubkey"
            },
            {
              "name": "unclaimedRewards",
              "type": "u64"
            },
            {
              "name": "claimedCount",
              "type": "u64"
            }
          ]
        }
      },
      {
        "name": "memeRegistryCreated",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "memeId",
              "type": {
                "array": [
                  "u8",
                  16
                ]
              }
            },
            {
              "name": "startTime",
              "type": "i64"
            },
            {
              "name": "endTime",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "memeStarted",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "memeId",
              "type": {
                "array": [
                  "u8",
                  16
                ]
              }
            },
            {
              "name": "mint",
              "type": "pubkey"
            },
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "symbol",
              "type": "string"
            },
            {
              "name": "uri",
              "type": "string"
            },
            {
              "name": "totalFunds",
              "type": "u64"
            }
          ]
        }
      },
      {
        "name": "minBuyAmountUpdated",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "oldAmount",
              "type": "u64"
            },
            {
              "name": "newAmount",
              "type": "u64"
            }
          ]
        }
      },
      {
        "name": "state",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "feeRecipient",
              "type": "pubkey"
            },
            {
              "name": "maxBuyAmount",
              "type": "u64"
            },
            {
              "name": "minBuyAmount",
              "type": "u64"
            },
            {
              "name": "authority",
              "type": "pubkey"
            },
            {
              "name": "fundDuration",
              "type": "i64"
            },
            {
              "name": "maxFundLimit",
              "type": "u64"
            },
            {
              "name": "commissionRate",
              "type": "u8"
            },
            {
              "name": "tokenClaimAvailableTime",
              "type": "i64"
            }
          ]
        }
      },
      {
        "name": "tokensClaimed",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "memeId",
              "type": {
                "array": [
                  "u8",
                  16
                ]
              }
            },
            {
              "name": "contributor",
              "type": "pubkey"
            },
            {
              "name": "amount",
              "type": "u64"
            }
          ]
        }
      }
    ]
  };
  