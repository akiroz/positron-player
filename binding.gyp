{
  "targets": [
    {
      "include_dirs" : [
        "<!(node -e \"require('nan')\")"
      ],
      "target_name": "decoder",
      "sources": [ "src/decoder/decoder.cc" ]
    }
  ]
}

