{
  "targets": [
    {
      "target_name": "nbtree",
      "sources": [
        "addons/nbtree/nbtree_binding.cpp"
      ],
      "include_dirs": [
        "dependencies/postgres/src/include/access/nbtree.h",
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "libraries": [
        "<(module_root_dir)/addons/nbtree/libnbtree.a"
      ],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"]
    }
  ]
}
