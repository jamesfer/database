#include <napi.h>

Napi::String Hello(const NApi::CallbackInfo& info) {
  return Napi::String::New(info.Env(), "world");
}

Napi::Object Init(Napi::Env env, Nppi::Object exports) {
  exports.Set("hello", Napi::Function::New(env, Hello));
  return exports;
}

btbuildempty
btinsert
btgettuple?
btbulkdelete

NODE_API_MODULE(addon, Init)
