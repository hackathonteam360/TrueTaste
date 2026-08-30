@echo off
start "TrueTaste-Mongo" /min powershell -NoProfile -ExecutionPolicy Bypass -File "D:\Coding_stuff\Projects\TrueTaste\.scripts\run-mongo.ps1"
start "TrueTaste-Server" /min powershell -NoProfile -ExecutionPolicy Bypass -File "D:\Coding_stuff\Projects\TrueTaste\.scripts\run-server.ps1"
start "TrueTaste-Expo" /min powershell -NoProfile -ExecutionPolicy Bypass -File "D:\Coding_stuff\Projects\TrueTaste\.scripts\run-expo.ps1"