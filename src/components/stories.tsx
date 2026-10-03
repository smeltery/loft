import { stories } from '../copy'

export default function Stories() {
  return (
    <section className="stories wrap">
      <h2>your files in the cloud. zero on your mac.</h2>
      <p>
        loft looks like a normal drive. open a film and it plays right away,
        because your mac only grabs the part it needs. nothing gets copied to
        your disk, so your mac keeps its space. delete something by mistake? you
        have 30 days to get it back.
      </p>
      <p className="lede tight">made for big files.</p>
      <ol>
        {stories.map((story) => (
          <li key={story.kicker}>
            <div className="mock">{story.kicker}</div>
            <h3>{story.kicker}</h3>
            <p>{story.title}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
