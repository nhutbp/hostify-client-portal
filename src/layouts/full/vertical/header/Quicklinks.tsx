import { Link } from '@tanstack/react-router'
import * as QuicklinksData from './data'

const Quicklinks = () => {
  return (
    <div className="border-border dark:border-darkborder border-s-0 p-5 lg:p-5 xl:border-s">
      <h5 className="text-ld mb-4 text-xl font-semibold">Quick Links</h5>
      <ul>
        {QuicklinksData.pageLinks.map((links, index) => (
          <li className="mb-4" key={index}>
            <Link
              to={links.href}
              className="text-link dark:text-darklink hover:text-primary dark:hover:text-primary text-sm font-semibold"
            >
              {links.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Quicklinks
