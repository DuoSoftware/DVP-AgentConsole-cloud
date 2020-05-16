/**
 * Created by Rajinda Waruna on 25/04/2018.
 */

agentApp.factory('veery_sip_phone', function ($crypto, websocketServices, jwtHelper, authService, resourceService,shared_data) {

    var ui_events = {};
    var socket_events = {
        onError:function (event) {
            if (ui_events.onError) {
                ui_events.onError(event);
            }
        },
        onClose:function (event) {
            if (ui_events.onClose) {
                ui_events.onClose(event);
            }
        },
        onMessage:function (event) {
            if (ui_events.onMessage) {
                ui_events.onMessage(event);
            }
        }
    };
    var registerSipPhone = function (veery_api_key,phone_setting) {
        var decodeData = jwtHelper.decodeToken(authService.TokenWithoutBearer());
        var values = decodeData.context.veeryaccount.contact.split("@");
        var name = values[0];
        var password = password;
        resourceService.SipUserPassword(values[0]).then(function (reply) {
            var decrypted = $crypto.decrypt(reply, "DuoS123");
            if (decrypted)
                password = decrypted;
            websocketServices.send(veery_api_key + "|Registor|123456789|" + name + "-" + password + "-" + decodeData.context.veeryaccount.contact);
        }, function (error) {
            console.log("Phone Offline....Sip Password-errr");
            if (ui_events.onError) {
                ui_events.onError(error);
            }
        });
        /*var values = decodeData.context.veeryaccount.contact.split("@");
        var name = values[0];
        var password = password;
        resourceService.SipUserPassword(values[0]).then(function (reply) {
            var decrypted = $crypto.decrypt(reply, "DuoS123");
            if (decrypted)
                password = decrypted;
            websocketServices.send(veery_api_key + "|Registor|123456789|" + name + "-" + password + "-" + values[1]);
        }, function (error) {
            console.log("Phone Offline....Sip Password-errr");
            if (ui_events.onError) {
                ui_events.onError(error);
            }
        });*/
    };
    return {
        getName: function () {
            return 'veery_sip_phone';
        },
        resetPhone:function (key) {
            ui_events = {};
            websocketServices.send(key + "|Unregistor|veery|veery");
        },
        autoAnswer: function (key,delay) {
            websocketServices.send(key + "|EnableAutoAnswer|"+delay+"|"+delay);
        },
        registerSipPhone: function (key,phone_setting) {
            registerSipPhone(key);
        },
        subscribeEvents: function (events) {
            ui_events = events;
            websocketServices.SubscribeEvents(socket_events);
            websocketServices.send("veery|Initiate|veery|othr");
        },
        unsubscribeEvents: function () {
            ui_events = {};
            websocketServices.unsubscribeEvents();
        },
        incomingCall:function (key,number) {
            shared_data.callDetails.number = number;
            shared_data.callDetails.direction = "inbound";
        },
        makeCall: function (key,number,my_id) {
            websocketServices.send(key + "|MakeCall|" + number + "|veery");
        },
        answerCall: function (key,session_id) {
            websocketServices.send(key + "|AnswerCall|veery|veery");
        },
        rejectCall: function (key,session_id) {
            websocketServices.send(key + "|RejectCall|veery|veery");
        },
        endCall: function (key,session_id) {
            websocketServices.send(key + "|EndCall|veery|veery");
        },
        etlCall: function (key,session_id) {
            websocketServices.send(key + "|EtlCall|veery|veery");
        },
        transferCall: function (key,session_id, number,callref_id) {
            websocketServices.send(key + "|TransferCall|" + number + "|veery");
        },
        transferIVR: function (key,session_id, number,callref_id) {
            websocketServices.send(key + "|TransferIVR|" + number + "|veery");
        },
        swapCall: function (key,session_id) {
            websocketServices.send(key + "|EndCall|veery|veery");
        },
        holdCall: function (key,session_id) {
            websocketServices.send(key + "|HoldCall|veery|veery");
        },
        unholdCall: function (key,session_id) {
            websocketServices.send(key + "|HoldCall|veery|veery");
        },
        muteCall: function (key,session_id) {
            websocketServices.send(key + "|MuteCall|veery|veery");
        },
        unmuteCall: function (key,session_id) {
            websocketServices.send(key + "|MuteCall|veery|veery");
        },
        conferenceCall: function (key,session_id) {
            websocketServices.send(key + "|ConfCall|veery|veery");
        },
        freezeAcw: function (key, session_id) {
            resourceService.FreezeAcw(session_id, true).then(function (response) {
                if (ui_events.onMessage) {
                   var msg = {"veery_command":"FreezeReqCancel","session_id":session_id};
                   if(response){
                       msg = {"veery_command":"Freeze","session_id":session_id} ;
                   }
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            }, function (err) {
                console.error(err);
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"FreezeReqCancel"};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }

            });
        },
        endFreeze: function (key, session_id) {
            resourceService.FreezeAcw(session_id, false).then(function (response) {
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"EndFreeze","session_id":session_id};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            }, function (err) {
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"EndFreeze"};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            });
        },
        endAcw: function (key, session_id) {
            resourceService.EndAcw(session_id).then(function (response) {
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"EndFreeze","session_id":session_id};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            }, function (err) {
                if (ui_events.onMessage) {
                    var msg = {"veery_command":"EndFreeze"};
                    var event = {
                        data : JSON.stringify(msg)
                    };
                    ui_events.onMessage(event);
                }
            });
        },
        send_dtmf: function (key,session_id,dtmf) {

        },
        unregister: function (key) {
            websocketServices.send(key + "|Unregistor|veery|veery");
            if (ui_events.onMessage) {
                var msg = {"veery_command":"Offline"};
                var event = {
                    data : JSON.stringify(msg)
                };
                ui_events.onMessage(event);
            }
        },
        phone_mode_change:function (key,mode) {
            websocketServices.send(key + "|"+mode+"|veery|veery");
            if (ui_events.onMessage) {
                var msg = {"veery_command":mode};
                var event = {
                    data : JSON.stringify(msg)
                };
                ui_events.onMessage(event);
            }
        }
    };

});