import mongoose from "mongoose";
const { Schema } = mongoose;

mongoose.connect(
  "mongodb+srv://thoi:12345@cluster0.vzj6r.mongodb.net/Twitty",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
    dropDups: true,
  },
  () => console.log(" Mongoose is connected")
);

const UserSchema = new Schema(
  {
    id: { type: Number, unique: true, required: true },
    id_str: { type: String, unique: true, required: true },
    name: String,
    screen_name: { type: String, unique: true, required: true },
    screen_name_low: String,
    localtion: String,
    url: String,
    protected: Boolean,
    followers_count: Number,
    friends_count: Number,
    created_at: Date,
    favourites_count: Number,
    statuses_count: Number,
    media_count: Number,
    profile_image_url: String,
    friends_list: Array,
    followers_list: Array,
    location: String,
    description: String,
  },
  {
    versionKey: false,
    timestamps: { createdAt: "_created_at", updatedAt: "_updated_at" },
  }
);

const AuthenticationSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
    csrf_token: String,
    cookies: String,
    baerer_token: String,
    is_alive: { type: Boolean, default: false },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "_created_at", updatedAt: "_updated_at" },
  }
);
const Auth = new mongoose.model("Authentication", AuthenticationSchema);
const User = new mongoose.model("User", UserSchema);

export { User, Auth, mongoose };
