/**
 * Copyright 2015 Jan Svager
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @providesModule ActionTypes
 **/

import keyMirror from "react/lib/keyMirror";

export default keyMirror({
  // play store
  POINTER_LOCK_CHANGE: null,
  LOADING_PROGRESS_CHANGE: null,
  // event store
  MOUSE_MOVE_EVENT: null,
  KEY_DOWN_EVENT: null,
  KEY_UP_EVENT: null
});
