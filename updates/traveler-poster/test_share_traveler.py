"""A new illustration must not change statistics or expose hidden task names."""
import io
import unittest
from PIL import Image
from poster_studio import render_poster

class TravelerPosterTests(unittest.TestCase):
    def test_all_sizes_and_hidden_data(self):
        stats=dict(first='2026-01-01',last='2026-12-31',basis='completed',completed=7,total=9,seconds=1500,sessions=1,ontime=5,late=2,distribution={'2026-10':7},tasks=[],categories={})
        for size,dimensions in [('portrait',(1080,1920)),('square',(1080,1080)),('landscape',(1200,630))]:
            config=dict(theme='yearbook',person='traveler',size=size,show_titles=False)
            raw=render_poster(stats,config)
            with Image.open(io.BytesIO(raw)) as image:self.assertEqual(image.size,dimensions)
            changed=dict(stats,tasks=[dict(id='private',title='PRIVATE_TITLE',list_name='PRIVATE_LIST')])
            self.assertEqual(raw,render_poster(changed,config))
    def test_unknown_person_rejected(self):
        with self.assertRaises(ValueError):render_poster({},dict(person='../private'))

if __name__=='__main__':unittest.main()
