###
Copyright 2015 Jan Svager & Michael Muller

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
###

THREE = require("three")

class Controls
  pointerLocked: false
  havePointerLock:
    "pointerLockElement" of document or
    "mozPointerLockElement" of document or
    "webkitPointerLockElement" of document
  blocker: document.getElementById("blocker")
  instructions: document.getElementById("instructions")
  keys:
    SPACE: false
    A: false
    D: false
    S: false
    W: false
  velocity: new THREE.Vector3
  prevTime: 0
  canJump: true

  constructor: (camera, @enabled=true) ->

    camera.rotation.set(0, 0, 0)

    @cameraPitch = camera

    @camera = new THREE.Object3D
    @camera.position.y = 10
    @camera.add(camera)

    if @havePointerLock
      @blocker.addEventListener('click', @handleClick)
      document.addEventListener('pointerlockchange', @handleLockChange)
      document.addEventListener('mozpointerlockchange', @handleLockChange)
      document.addEventListener('webkitpointerlockchange', @handleLockChange)
      document.addEventListener('mousemove', @handleMouseMove)
      document.addEventListener("keydown", @handleKeyDown)
      document.addEventListener("keyup", @handleKeyUp)
    else
      @enabled = false
      @instructions.innerHTML = "Your browser doesn't seem to support Pointer Lock API"

  getCamera: ->
    @camera

  render: =>
    if @enabled and @pointerLocked

      time = performance.now()

      delta = (time - @prevTime) / 1000

      @velocity.x -= @velocity.x * 10.0 * delta
      @velocity.z -= @velocity.z * 10.0 * delta

      @velocity.y -= 9.823 * 3.0 * delta

      @velocity.z -= 10.0 * delta if @keys.W
      @velocity.z += 10.0 * delta if @keys.S
      @velocity.x -= 10.0 * delta if @keys.A
      @velocity.x += 10.0 * delta if @keys.D

      if @keys.SPACE
        @velocity.y += 7.0 if @canJump
        @canJump = false

      @camera.translateX(@velocity.x)
      @camera.translateY(@velocity.y)
      @camera.translateZ(@velocity.z)

      if @camera.position.y < 10
        @canJump = true
        @velocity.y = 0
        @camera.position.y = 10

      @prevTime = time


  handleLockChange: =>
    @pointerLocked =
      document["pointerLockElement"] is @blocker or
      document["mozPointerLockElement"] is @blocker or
      document["webkitPointerLockElement"] is @blocker
    @blocker.style.opacity = if @pointerLocked then 0 else 1

  handleClick: =>
    @blocker.requestPointerLock =
      @blocker["requestPointerLock"] or
      @blocker["mozRequestPointerLock"] or
      @blocker["webkitRequestPointerLock"]
    @blocker.requestPointerLock()

  handleMouseMove: (event) =>
    return if not @pointerLocked
    movementX = event["movementX"] or event["mozMovementX"] or event["webkitMovementX"] or 0
    movementY = event["movementY"] or event["mozMovementY"] or event["webkitMovementY"] or 0
    @camera.rotation.y -= movementX * 0.002
    @cameraPitch.rotation.x -= movementY * 0.002
    @cameraPitch.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, @cameraPitch.rotation.x))

  handleKeyDown: (e) =>
    switch e.keyCode
      when 32 then @keys.SPACE = true
      when 65 then @keys.A = true
      when 68 then @keys.D = true
      when 83 then @keys.S = true
      when 87 then @keys.W = true

  handleKeyUp: (e) =>
    switch e.keyCode
      when 32 then @keys.SPACE = false
      when 65 then @keys.A = false
      when 68 then @keys.D = false
      when 83 then @keys.S = false
      when 87 then @keys.W = false


module.exports = Controls