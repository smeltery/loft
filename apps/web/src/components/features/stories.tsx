import { stories } from '../../copy'
import { FeatureMock } from './feature-mocks'
import './stories.css'

export default function Stories() {
  return (
    <>
      <section className="prose wrap">
        <h2>
          your files in the cloud.
          <br />
          zero on your mac.
        </h2>
        <p>
          loft looks like a normal drive. open a film and it plays right away,
          because your mac only grabs the part it needs.
        </p>
        <p>
          nothing gets copied to your disk, so your mac keeps its space. delete
          something by mistake? you have 30 days to get it back.
        </p>
        <div className="flow">
          drop <i>→</i> stream <i>→</i> space
        </div>
      </section>
      <section className="section wrap centered">
        <h2>
          made for <em>big files</em>.
        </h2>
        <div className="moments">
          {stories.map((story, i) => (
            <figure className="moment" key={story.kicker}>
              <div className={`m-photo forest-${i + 1}`} aria-hidden="true">
                <FeatureMock index={i} />
              </div>
              <figcaption>
                <b>{story.kicker}</b>
                <span>{story.title}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  )
}
