import unittest
import url


class TestStringMethods(unittest.TestCase):

    def test_upper(self):
        self.assertEqual(
            url.normalize(
                "https://discord.com/blog/how-discord-indexes-billions-of-messages?utm_source=pocket_reader"),
            "https://discord.com/blog/how-discord-indexes-billions-of-messages"
        )


if __name__ == '__main__':
    unittest.main()
