import { site } from '../copy'
import FinderStage from './finder-stage'

export default function Hero() {
  return (
    <section className="hero wrap" id="top">
      <h1>{site.headline}</h1>
      <p className="lede">{site.lede}</p>
      <FinderStage />
    </section>
  )
}
