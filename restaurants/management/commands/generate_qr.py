import os
from pathlib import Path

import qrcode
from django.core.management.base import BaseCommand

from tables.models import Table


class Command(BaseCommand):
    help = "Generate permanent QR codes for each table (PNG files under qr/)."

    def handle(self, *args, **options):
        base = os.getenv("PUBLIC_BASE_URL", "http://localhost:5173").rstrip("/")
        output_dir = Path("qr")
        output_dir.mkdir(exist_ok=True)
        for table in Table.objects.select_related("restaurant").all():
            url = f"{base}/r/{table.restaurant.slug}/t/{table.id}"
            path = output_dir / f"{table.restaurant.slug}_table_{table.number}.png"
            qrcode.make(url).save(path)
            self.stdout.write(self.style.SUCCESS(f"Saved {path} -> {url}"))
