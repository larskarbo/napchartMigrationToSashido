const fs = require("fs-extra");
const Parse = require("parse/node");

Parse.initialize(
  "osxjLrTMW7cJ6r6IPOpDYXyuBzBRSzQTaNeza7O6",
  "rijTlVRNfqPPV2X9MLnRAP1UDzQbz7UTRjfCOaQ6"
);
Parse.serverURL =
  "https://pg-app-57gagyy9xq3pta5kvgpzs2dh6gv7w5.scalabl.cloud/1/";

var LineByLineReader = require("line-by-line"),
  lr = new LineByLineReader("here.json");

lr.on("error", function(err) {
  console.log("err: ", err);
  // 'err' contains error object
});
let i = 0;
let skipped = 0;
let working = 0;
let added = 0;
lr.on("line", async function(line) {
  // pause emitting of lines...
  lr.pause();
  // Simple syntax to create a new subclass of Parse.Object.
  var Chart = Parse.Object.extend("Chart");

  // // Create a new instance of that class.
  const obj = JSON.parse(line);
  var chart = new Chart();

  // chart.set("id", obj.id)
  i++;
  working++;
  console.log("i: ", i, "skipped: ", skipped, "working: ", working, "added: ", added);
  var title = "";
  if (typeof obj.metaInfo != "undefined") {
    title = obj.metaInfo.title;
  }
  var description = "";
  if (typeof obj.metaInfo != "undefined") {
    description = obj.metaInfo.description;
  }

  const query = new Parse.Query("Chart");
  query.equalTo("chartid", obj.id);
  if (working < 1500) {
    lr.resume();
  }
  const already = await query.find();
  if (already.length) {
    skipped++;
    working--;

    if (working < 1500) {
      lr.resume();
    }
    return;
  }

  chart
    .save({
      chartid: obj.id,
      title,
      description,
      chartData: obj.chartData
    })
    .then(
      gameScore => {
        // Execute any logic that should take place after the object is saved.
        // console.log('New object created with objectId: ' + gameScore.id);
        working--;
        added++
        if (working < 1500) {
          lr.resume();
        }
      },
      error => {
        console.log("error: ", error);
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and message.
        // alert('Failed to create new object, with error code: ' + error.message);
      }
    );

  // ...do your asynchronous line processing..
  // setTimeout(function() {
  // ...and continue emitting lines.

  // }, 100);
});

lr.on("end", function() {
  console.log('"end": ', "end");
  console.log("skipped: ", skipped);
  // All lines are read, file is closed now.
});
