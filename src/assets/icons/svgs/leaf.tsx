import * as React from "react"
import { Svg, Path } from 'react-native-svg';
const leaf = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={32}
    height={33}
    fill="none"
    {...props}
  >
    <Path
      fill="#23AE5E"
      fillRule="evenodd"
      d="m26.49 7.745-5.094 4.53 2.782.65c.291.068.4.426.195.644l-.006.006a.399.399 0 0 1-.382.12l-3.314-.776-.696.618a.394.394 0 0 1-.557-.033l-.006-.007a.392.392 0 0 1 .034-.553l2.479-2.205h-.011l-.237-2.627a.391.391 0 0 1 .28-.414l.008-.002c.239-.066.48.1.502.347l.185 2.05 3.323-2.952a.388.388 0 0 1 .232-.097h.006c.247-.016.443.2.406.444l-.004.027a.387.387 0 0 1-.125.23ZM12.03 20.54l-.695-.62-3.32.776a.4.4 0 0 1-.38-.119l-.007-.006a.388.388 0 0 1 .195-.644l2.786-.651-5.098-4.53a.387.387 0 0 1-.125-.229l-.005-.029a.384.384 0 0 1 .405-.442h.007c.085.006.167.04.23.097L9.349 17.1l.185-2.053a.397.397 0 0 1 .503-.348l.007.003a.39.39 0 0 1 .28.413l-.237 2.628-.016-.001 2.485 2.209a.39.39 0 0 1 .034.548l-.006.008a.39.39 0 0 1-.554.034ZM27.274 5.85c-.25.002-6.133.068-8.394 2.098a4.516 4.516 0 0 0-1.501 3.137 4.506 4.506 0 0 0 .786 2.8c-.61.55-1.197 1.085-1.647 1.497v-10.6h-1.092v17.553a268.48 268.48 0 0 0-1.592-1.448c.56-.82.84-1.792.785-2.8a4.512 4.512 0 0 0-1.5-3.136c-2.262-2.031-8.146-2.097-8.395-2.099L4 12.847l.062.722c.02.241.53 5.937 2.985 8.141a4.527 4.527 0 0 0 3.034 1.162 4.538 4.538 0 0 0 3.037-1.16c1.017.917 1.968 1.793 2.309 2.108v4.582h1.092V16.867c.287-.264 1.29-1.19 2.364-2.158a4.51 4.51 0 0 0 3.04 1.163c1.12 0 2.189-.409 3.03-1.163 2.455-2.206 2.965-7.901 2.986-8.142L28 5.844l-.725.006Z"
      clipRule="evenodd"
    />
  </Svg>
)
export default leaf
