const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  userName: String,
  accountNumber: String,
  emailAddress: String,
  identityNumber: String,
});


UserSchema.method("toJson", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;

  return object;
});

const User = model("User", UserSchema);

module.exports = User;
