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
 * @providesModule IndexPage
 **/

import React from "react";
import Title from "react-document-title";
import { Link } from "react-router";
import { isBrowser } from "../utils/ExecutionEnvironment";

export default function(props) {

  if (isBrowser) require("./IndexPage.css");

  return {
    render() {
      const { version, githubLink } = props.initialState;
      return (
        <Title title="Game of Credit">
          <div id="index-page">
            <h1>Game of Credit
              <small className="version">v{version}</small>
            </h1>
            <h2>3D first person multiplayer shooter</h2>
            <Link className="button" to="play">PLAY NOW</Link>

            <p>
              For more information checkout GitHub&nbsp;
              <a href={githubLink} target="_blank">repository</a>.
            </p>
          </div>
        </Title>
      );
    }
  };
}