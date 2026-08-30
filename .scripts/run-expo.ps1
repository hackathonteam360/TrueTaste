$env:Path = "C:\Users\DUNIYA TRADER\scoop\shims;C:\Users\DUNIYA TRADER\scoop\apps\nodejs-lts\current;" + $env:Path
Set-Location "D:\Coding_stuff\Projects\TrueTaste\mobile"
npx expo start *> "D:\Coding_stuff\Projects\TrueTaste\.scripts\expo.log"