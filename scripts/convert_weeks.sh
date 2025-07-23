#!/bin/bash
set -e
for dir in sections/main-theory sections/support-activities sections/advanced-activities; do
  for f in "$dir"/week*.html; do
    [ -f "$f" ] || continue
    weeknum=$(basename "$f" .html | sed 's/week//')
    tmp=$(mktemp)
    awk 'BEGIN{p=0} /<details/{p=1} p{print}' "$f" > "$tmp"
    cat > "$f" <<EOF2
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Bedside Table — Week $weeknum</title>
  <style>
    body {font-family: Arial, sans-serif; line-height: 1.5; margin: 1rem 2rem;}
    fieldset {border: 1px solid #777; padding: 1rem;}
    legend   {padding: 0 .5rem;}
    .quiz-msg {margin-left: 1rem; font-weight: bold;}
    button.check-btn {margin-top: 1rem; padding: .4rem .8rem; cursor: pointer;}
  </style>
</head>
<body>
EOF2
    cat "$tmp" >> "$f"
    rm "$tmp"
  done
done
