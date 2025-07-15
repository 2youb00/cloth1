import React from 'react'

export default function Footer({ siteSettings }) {
  return (
    <footer className="bg-black text-white py-8 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="w-full md:w-1/2 mb-6 md:mb-0">
          <h3 className="text-lg font-bold mb-2">{siteSettings.siteName}</h3>
          <p>{siteSettings.footerText}</p>
        </div>
        <div className="w-full md:w-1/3 mb-6 md:mb-0">
          <h3 className="text-lg font-bold mb-2">Contact Us</h3>
          <p>Email: {siteSettings.contactEmail}</p>
          <p>Phone: {siteSettings.contactPhone}</p>
        </div>
        <div className="w-full md:w-1/3">
          <h3 className="text-lg font-bold mb-2">Follow Us</h3>
          <div className="flex space-x-4">
            {siteSettings.socialLinks && (
              <>
                <a href={siteSettings.socialLinks.facebook} className="hover:text-gray-300">Facebook</a>
                <a href={siteSettings.socialLinks.instagram} className="hover:text-gray-300">Instagram</a>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <p>&copy; {new Date().getFullYear()} {siteSettings.siteName}. Developed by AYOUB SOUAYEB</p>
      </div>
    </footer>
  )
}